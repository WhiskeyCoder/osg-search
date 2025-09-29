export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  content?: string;
  score: number;
  timestamp?: string;
  source?: string;
  // Images
  imageUrl?: string;
  imageBase64?: string;
  thumbnailUrl?: string;
  // Location
  latitude?: number;
  longitude?: number;
  address?: string;
  country?: string;
  coordinates?: [number, number]; // [lat, lon]
  // Shopping
  price?: number;
  currency?: string;
  // Raw JSON for structured rendering
  rawJson?: any;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  query: string;
  took: number;
}

export interface FilterOptions {
  sortBy: 'relevance' | 'newest' | 'oldest';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';
  customDateRange?: {
    from: string;
    to: string;
  };
  timeFrame?: 'last_hour' | 'last_24h' | 'last_week' | 'last_month';
}

class OpenSearchService {
  private baseUrl: string;
  private indexName: string;
  private indexMapping: { [key: string]: string };

  constructor() {
    // Prefer dev-server proxy when available to avoid CORS; fallback to 9200
    this.baseUrl = process.env.REACT_APP_OPENSEARCH_URL || '';

    // Default index for Tika-ingested documents
    // NOTE: change 'file_index' to match your database/schema name in OpenSearch
    this.indexName = process.env.REACT_APP_OPENSEARCH_INDEX || 'file_index';
    
    // Map search tabs to their respective indices
    this.indexMapping = {
      'all': 'file_index',
      'net': 'file_index',
      'images': 'images_index',
      'maps': 'file_index',
      'shopping': 'file_index',
      'videos': 'videos_index',
      'news': 'news_index',
      'books': 'books_index'
    };
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    const url = `${this.baseUrl}${endpoint}` || endpoint;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenSearch Error Response:', errorText);
        throw new Error(`OpenSearch request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OpenSearch Request Error:', error);
      throw error;
    }
  }

  private extractDocumentData(source: any) {
    let title = 'Untitled';
    let url = '#';
    let snippet = '';
    let imageUrl: string | undefined;
    let imageBase64: string | undefined;
    let thumbnailUrl: string | undefined;
    let latitude: number | undefined;
    let longitude: number | undefined;
    let address: string | undefined;
    let country: string | undefined;
    let coordinates: [number, number] | undefined;
    let price: number | undefined;
    let currency: string | undefined;
    
    // Try to extract title and URL from raw_content JSON
    try {
      const rawData = JSON.parse(source.raw_content || '{}');
      title = rawData.title || source.file_name || 'Untitled';
      url = rawData.url || '#';
      snippet = rawData.summary || rawData.full_text?.substring(0, 200) + '...' || source.content?.substring(0, 200) + '...' || '';

      // Common image shapes: single fields or arrays
      imageUrl = rawData.image_url || rawData.thumbnail || rawData.thumbnail_url || undefined;
      imageBase64 = rawData.image_base64 || undefined;
      thumbnailUrl = rawData.thumbnail || rawData.thumbnail_url || undefined;
      if (!imageUrl && Array.isArray(rawData.images) && rawData.images.length > 0) {
        const first = rawData.images[0];
        if (typeof first === 'string') {
          imageUrl = first;
        } else if (first && typeof first === 'object') {
          imageUrl = first.url || first.src || first.href;
          imageBase64 = imageBase64 || first.base64 || first.data;
          thumbnailUrl = thumbnailUrl || first.thumbnail || first.thumb;
        }
      }

      // Location fields that might come from Tika or enrichment
      address = rawData.Address || rawData.address || rawData.Location || rawData.location || undefined;
      country = rawData.Country || rawData.country || undefined;

      const latFromRaw = rawData.Lat || rawData.lat || rawData.latitude;
      const lonFromRaw = rawData.Long || rawData.long || rawData.lng || rawData.longitude;
      if (typeof latFromRaw === 'number' && typeof lonFromRaw === 'number') {
        latitude = latFromRaw;
        longitude = lonFromRaw;
        coordinates = [latFromRaw, lonFromRaw];
      } else if (typeof rawData['lat Long'] === 'string') {
        const parts = rawData['lat Long'].split(/[,\s]+/).map((p: string) => parseFloat(p));
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          latitude = parts[0];
          longitude = parts[1];
          coordinates = [parts[0], parts[1]];
        }
      } else if (Array.isArray(rawData.Coordinates) && rawData.Coordinates.length >= 2) {
        const lat = parseFloat(rawData.Coordinates[0]);
        const lon = parseFloat(rawData.Coordinates[1]);
        if (!isNaN(lat) && !isNaN(lon)) {
          latitude = lat;
          longitude = lon;
          coordinates = [lat, lon];
        }
      }

      // Shopping
      if (rawData.price !== undefined) {
        const parsedPrice = typeof rawData.price === 'string' ? parseFloat(rawData.price.replace(/[^0-9.-]/g, '')) : Number(rawData.price);
        if (!isNaN(parsedPrice)) {
          price = parsedPrice;
        }
      }
      currency = rawData.currency || (typeof rawData.price === 'string' ? (rawData.price.match(/[€$£]|USD|EUR|GBP/i)?.[0] || undefined) : undefined);
      // Fallback to direct fields if present at root
      imageUrl = imageUrl || source.image_url || source.thumbnail_url || source.imageUrl;
      imageBase64 = imageBase64 || source.image_base64 || source.imageBase64;
      thumbnailUrl = thumbnailUrl || source.thumbnail_url || source.thumbnailUrl;
    } catch (e) {
      // Fallback to direct field mapping
      title = source.file_name || 'Untitled';
      snippet = source.content?.substring(0, 200) + '...' || '';
      imageUrl = source.image_url || source.thumbnail_url || source.imageUrl;
      imageBase64 = source.image_base64 || source.imageBase64;
      thumbnailUrl = source.thumbnail_url || source.thumbnailUrl;
    }
    
    return {
      title,
      url,
      snippet,
      imageUrl,
      imageBase64,
      thumbnailUrl,
      latitude,
      longitude,
      address,
      country,
      coordinates,
      price,
      currency
    };
  }

  private getDateRangeFilter(filters: FilterOptions) {
    const now = new Date();
    let fromDate: string | undefined;
    let toDate: string | undefined;

    // Handle custom date range
    if (filters.dateRange === 'custom' && filters.customDateRange) {
      fromDate = filters.customDateRange.from;
      toDate = filters.customDateRange.to;
    } else {
      // Handle predefined date ranges
      switch (filters.dateRange) {
        case 'today':
          fromDate = now.toISOString().split('T')[0];
          toDate = now.toISOString().split('T')[0];
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          fromDate = weekAgo.toISOString().split('T')[0];
          toDate = now.toISOString().split('T')[0];
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          fromDate = monthAgo.toISOString().split('T')[0];
          toDate = now.toISOString().split('T')[0];
          break;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          fromDate = yearAgo.toISOString().split('T')[0];
          toDate = now.toISOString().split('T')[0];
          break;
      }
    }

    // Handle time frame filters
    if (filters.timeFrame) {
      const timeFrameMap = {
        'last_hour': 60 * 60 * 1000,
        'last_24h': 24 * 60 * 60 * 1000,
        'last_week': 7 * 24 * 60 * 60 * 1000,
        'last_month': 30 * 24 * 60 * 60 * 1000
      };
      
      const timeAgo = new Date(now.getTime() - timeFrameMap[filters.timeFrame]);
      fromDate = timeAgo.toISOString();
      toDate = now.toISOString();
    }

    if (fromDate && toDate) {
      return {
        range: {
          created_date: {
            gte: fromDate,
            lte: toDate
          }
        }
      };
    }

    return null;
  }

  private getSortOptions(sortBy: FilterOptions['sortBy']) {
    switch (sortBy) {
      case 'newest':
        return [
          { created_date: { order: 'desc' } },
          { _score: { order: 'desc' } }
        ];
      case 'oldest':
        return [
          { created_date: { order: 'asc' } },
          { _score: { order: 'desc' } }
        ];
      case 'relevance':
      default:
        return [
          { _score: { order: 'desc' } },
          { created_date: { order: 'desc' } }
        ];
    }
  }

  private getIndexForTab(tab: string): string {
    return this.indexMapping[tab] || this.indexName;
  }

  async search(
    query: string, 
    page: number = 1, 
    size: number = 10, 
    filters: FilterOptions = { sortBy: 'relevance', dateRange: 'all' },
    tab: string = 'all'
  ): Promise<SearchResponse> {
    try {
      const from = (page - 1) * size;
      
      // Build the query with filters
      const queryClause: any = {
        multi_match: {
          query: query,
          fields: ['content^3', 'file_name^2', 'raw_content'],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      };

      // Add date range filter if specified
      const dateFilter = this.getDateRangeFilter(filters);
      const boolQuery: any = {
        must: [queryClause]
      };

      if (dateFilter) {
        boolQuery.filter = [dateFilter];
      }

      const searchBody = {
        query: {
          bool: boolQuery
        },
        highlight: {
          fields: {
            content: {},
            file_name: {},
            raw_content: {}
          }
        },
        from,
        size,
        sort: this.getSortOptions(filters.sortBy)
      };

      const targetIndex = this.getIndexForTab(tab);
      const response = await this.makeRequest(
        `/${targetIndex}/_search`,
        'POST',
        searchBody
      );

      const hits = response.hits;
      const results: SearchResult[] = hits.hits.map((hit: any) => {
        const source = hit._source;
        const extracted = this.extractDocumentData(source);
        
        return {
          id: hit._id,
          title: extracted.title,
          url: extracted.url,
          snippet: extracted.snippet,
          content: source.content,
          score: hit._score,
          timestamp: source.created_date,
          source: source.file_path || 'Unknown',
          imageUrl: extracted.imageUrl,
          imageBase64: extracted.imageBase64,
          thumbnailUrl: extracted.thumbnailUrl,
          latitude: extracted.latitude,
          longitude: extracted.longitude,
          address: extracted.address,
          country: extracted.country,
          coordinates: extracted.coordinates,
          price: extracted.price,
          currency: extracted.currency
        };
      });

      const total = typeof hits.total === 'number' ? hits.total : hits.total?.value || 0;

      return {
        results,
        total,
        page,
        totalPages: Math.ceil(total / size),
        query,
        took: response.took
      };
    } catch (error) {
      console.error('OpenSearch search error:', error);
      throw new Error('Failed to search documents');
    }
  }

  async getDocument(id: string): Promise<SearchResult | null> {
    try {
      const response = await this.makeRequest(`/${this.indexName}/_doc/${id}`);

      const source = response._source;
      if (!source) {
        return null;
      }

      const { title, url, snippet } = this.extractDocumentData(source);
      let rawJson: any = undefined;
      try {
        rawJson = source.raw_content ? JSON.parse(source.raw_content) : undefined;
      } catch {}

      return {
        id: response._id,
        title,
        url,
        snippet,
        content: source.content,
        score: 0,
        timestamp: source.created_date,
        source: source.file_path || 'Unknown',
        rawJson
      };
    } catch (error) {
      console.error('OpenSearch get document error:', error);
      return null;
    }
  }

  async advancedSearch(
    query: string,
    filters: {
      dateRange?: { from: string; to: string };
      source?: string;
      exactPhrase?: boolean;
    },
    page: number = 1,
    size: number = 10
  ): Promise<SearchResponse> {
    try {
      const from = (page - 1) * size;
      
      let queryType = 'multi_match';
      let queryValue = query;

      if (filters.exactPhrase) {
        queryType = 'match_phrase';
        queryValue = query;
      }

      const searchBody: any = {
        query: {
          bool: {
            must: [
              {
                [queryType]: {
                  query: queryValue,
                  fields: ['content^3', 'file_name^2', 'raw_content']
                }
              }
            ]
          }
        },
        highlight: {
          fields: {
            content: {},
            file_name: {},
            raw_content: {}
          }
        },
        from,
        size,
        sort: [
          { _score: { order: 'desc' } },
          { created_date: { order: 'desc' } }
        ]
      };

      // Add filters
      if (filters.dateRange) {
        searchBody.query.bool.filter = searchBody.query.bool.filter || [];
        searchBody.query.bool.filter.push({
          range: {
            created_date: {
              gte: filters.dateRange.from,
              lte: filters.dateRange.to
            }
          }
        });
      }

      if (filters.source) {
        searchBody.query.bool.filter = searchBody.query.bool.filter || [];
        searchBody.query.bool.filter.push({
          term: {
            file_path: filters.source
          }
        });
      }

      const response = await this.makeRequest(
        `/${this.indexName}/_search`,
        'POST',
        searchBody
      );

      const hits = response.hits;
      const results: SearchResult[] = hits.hits.map((hit: any) => {
        const source = hit._source;
        const { title, url, snippet } = this.extractDocumentData(source);
        
        return {
          id: hit._id,
          title,
          url,
          snippet,
          content: source.content,
          score: hit._score,
          timestamp: source.created_date,
          source: source.file_path || 'Unknown'
        };
      });

      const total = typeof hits.total === 'number' ? hits.total : hits.total?.value || 0;

      return {
        results,
        total,
        page,
        totalPages: Math.ceil(total / size),
        query,
        took: response.took
      };
    } catch (error) {
      console.error('OpenSearch advanced search error:', error);
      throw new Error('Failed to perform advanced search');
    }
  }
}

const opensearchService = new OpenSearchService();
export default opensearchService;
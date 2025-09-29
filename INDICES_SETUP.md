# OpenSearch Indices Setup

This document explains how to set up different OpenSearch indices for each search tab category.

## Current Index Mapping

The application is configured to use different indices for each search tab:

| Tab | Index Name | Description |
|-----|------------|-------------|
| All | `file_index` | Main documents index (default) |
| Web | `file_index` | Web pages and documents |
| Images | `images_index` | Image files and metadata |
| Videos | `videos_index` | Video files and metadata |
| News | `news_index` | News articles and RSS feeds |
| Books | `books_index` | Books and ebooks |
| Academic | `academic_index` | Academic papers and research |

## Setting Up Indices

### 1. Create Indices

For each category you want to support, create an index in OpenSearch:

```bash
# Create images index
curl -X PUT "localhost:9200/images_index" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "url": { "type": "keyword" },
      "content": { "type": "text" },
      "file_name": { "type": "text" },
      "raw_content": { "type": "text" },
      "created_date": { "type": "date" },
      "file_path": { "type": "keyword" },
      "image_url": { "type": "keyword" },
      "thumbnail_url": { "type": "keyword" },
      "alt_text": { "type": "text" }
    }
  }
}'

# Create videos index
curl -X PUT "localhost:9200/videos_index" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "url": { "type": "keyword" },
      "content": { "type": "text" },
      "file_name": { "type": "text" },
      "raw_content": { "type": "text" },
      "created_date": { "type": "date" },
      "file_path": { "type": "keyword" },
      "video_url": { "type": "keyword" },
      "thumbnail_url": { "type": "keyword" },
      "duration": { "type": "integer" }
    }
  }
}'

# Create news index
curl -X PUT "localhost:9200/news_index" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "url": { "type": "keyword" },
      "content": { "type": "text" },
      "file_name": { "type": "text" },
      "raw_content": { "type": "text" },
      "created_date": { "type": "date" },
      "file_path": { "type": "keyword" },
      "author": { "type": "text" },
      "source": { "type": "keyword" },
      "category": { "type": "keyword" }
    }
  }
}'

# Create books index
curl -X PUT "localhost:9200/books_index" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "url": { "type": "keyword" },
      "content": { "type": "text" },
      "file_name": { "type": "text" },
      "raw_content": { "type": "text" },
      "created_date": { "type": "date" },
      "file_path": { "type": "keyword" },
      "author": { "type": "text" },
      "isbn": { "type": "keyword" },
      "publisher": { "type": "text" },
      "publication_date": { "type": "date" }
    }
  }
}'

# Create academic index
curl -X PUT "localhost:9200/academic_index" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "url": { "type": "keyword" },
      "content": { "type": "text" },
      "file_name": { "type": "text" },
      "raw_content": { "type": "text" },
      "created_date": { "type": "date" },
      "file_path": { "type": "keyword" },
      "authors": { "type": "text" },
      "abstract": { "type": "text" },
      "doi": { "type": "keyword" },
      "journal": { "type": "text" },
      "keywords": { "type": "text" }
    }
  }
}'
```

### 2. Index Documents

Use your existing indexing scripts to populate each index with the appropriate content:

- **Images**: Index image files with metadata (EXIF data, alt text, etc.)
- **Videos**: Index video files with metadata (duration, resolution, etc.)
- **News**: Index RSS feeds, news articles, blog posts
- **Books**: Index ebooks, PDFs, book metadata
- **Academic**: Index research papers, theses, journal articles

### 3. Customize Index Mapping

You can modify the index mapping in `src/services/opensearchService.ts`:

```typescript
this.indexMapping = {
  'all': 'file_index',
  'web': 'file_index',
  'images': 'your_custom_images_index',
  'videos': 'your_custom_videos_index',
  'news': 'your_custom_news_index',
  'books': 'your_custom_books_index',
  'academic': 'your_custom_academic_index'
};
```

## Testing

1. Start the proxy server: `npm run proxy`
2. Start the React app: `npm start`
3. Search for content and switch between tabs
4. Each tab will search its respective index
5. If an index is empty, you'll see a "No data" message with suggestions

## Benefits

- **Organized Content**: Each content type has its own dedicated index
- **Better Performance**: Smaller, focused indices are faster to search
- **Flexible Schema**: Each index can have fields specific to its content type
- **Scalable**: Easy to add new content types and indices
- **User Experience**: Clear separation of content types with appropriate messaging

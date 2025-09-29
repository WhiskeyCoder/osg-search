// Environment configuration for OSG Search
// Defaults target local OpenSearch on http://localhost:9200
// and an index for Tika-parsed documents named 'file_index'.
// NOTE: Change 'file_index' to your OpenSearch index name/schema when deploying.
export const config = {
  opensearch: {
    url: process.env.REACT_APP_OPENSEARCH_URL || 'http://localhost:9200',
    index: process.env.REACT_APP_OPENSEARCH_INDEX || 'file_index'
  },
  security: {
    enabled: process.env.REACT_APP_ENABLE_SECURITY !== 'false'
  },
  app: {
    name: 'OSG Search',
    version: '1.0.0'
  }
};

// Test OpenSearch connection
export const testOpenSearchConnection = async () => {
  const baseUrl = process.env.REACT_APP_OPENSEARCH_URL || '';
  
  try {
    console.log('Testing OpenSearch connection to:', baseUrl);
    
    // Test cluster health via proxy-friendly path
    const response = await fetch((baseUrl || '') + '/_cluster/health');
    if (!response.ok) {
      const text = await response.text();
      console.error('OpenSearch root response error:', response.status, text);
      return false;
    }
    const data = await response.json();
    console.log('OpenSearch Info:', data);
    
    // Test if file_index exists
    const indexResponse = await fetch(`${baseUrl || ''}/file_index`);
    if (indexResponse.ok) {
      const indexData = await indexResponse.json();
      console.log('File Index Info:', indexData);
    } else {
      const text = await indexResponse.text();
      console.error('File index check failed:', indexResponse.status, text);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('OpenSearch Connection Test Failed:', error);
    return false;
  }
};

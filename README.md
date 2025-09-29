<div align="center">

# OSG-Search

### Open Source Google Search

Clean, fast, and familiar web search UI powered by OpenSearch + Apache Tika.

![image](https://github.com/WhiskeyCoder/osg-search/blob/main/images/2025-09-29%2014_51_51.png)

</div>

---

## ✨ Highlights

- **Google-like UI**: Tight, minimal SERP with Net, Images, Maps, Shopping, Videos, News, Books
- **OpenSearch-native**: Queries directly against your index (default: `file_index`)
- **Tika-friendly**: Designed for JSON produced by Apache Tika pipelines
- **Images**: Renders `image_base64`, `image_url`, `thumbnail_url`
- **Maps**: Leaflet map with dark/light tiles and markers from address/lat/long
- **Shopping**: Auto-detects items with `price` fields
- **Books**: Filters `.pdf` and `.epub`
- **Structured Reader**: Formats JSON fields into readable sections; auto sentence paragraphing
- **No lockouts**: Dev tools and selection fully enabled for contributors

> Made by [@WhiskeyCoder](https://github.com/WhiskeyCoder)

**Simple Search UI**
![image](https://github.com/WhiskeyCoder/osg-search/blob/main/images/2025-09-29%2014_50_27.png)

**Dynamic Content Loading**
![image](https://github.com/WhiskeyCoder/osg-search/blob/main/images/2025-09-29%2015_00_36.png)



---

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- OpenSearch instance running (default `http://localhost:9200`)
- Documents indexed in your target index (default `file_index`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd osg-search
```

2. Install dependencies:
```bash
npm install
```

3. Configure OpenSearch connection (optional):
Create a `.env` file in the root directory if you need custom settings:
```env
REACT_APP_OPENSEARCH_URL=http://localhost:9200
REACT_APP_OPENSEARCH_INDEX=file_index  # change to your index/schema
```

**Note**: The app defaults to local OpenSearch without authentication.

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

### OpenSearch Index Structure

Minimal doc shape:

```json
{
  "title": "Document Title",
  "url": "https://example.com/document",
  "content": "Full document content…",
  "snippet": "Short summary…",
  "created_date": "2024-01-01T00:00:00Z",
  "file_path": "/ingest/source.json"
}
```

Enriched shape (used across tabs):

```json
{
  "raw_content": "{ \"title\": \"…\", \"summary\": \"…\", \"images\": [\"https://…jpg\"] }",
  "image_url": "https://…jpg",
  "image_base64": "iVBOR…",
  "thumbnail_url": "https://…thumb.jpg",
  "Address": "1600 Amphitheatre Pkwy",
  "Country": "United States",
  "Lat": 37.422,
  "Long": -122.084,
  "price": 19.99,
  "currency": "USD"
}
```

### Building for Production

```bash
npm run build
```

This creates a `build` folder with the production-ready application.

## Usage

- Net: primary SERP with compact cards and 150-char snippets
- Images: grid (click opens local JSON doc view)
- Maps: full-width Leaflet map; theme-aware tiles
- Shopping: items with `price` (shows “Nothing for sale” when empty)
- Videos: basic detection (YouTube, Vimeo, `.mp4/.webm/.ogg`)
- News: placeholder for RSS integration
- Books: filters `.pdf`/`.epub`

## API Reference

OpenSearch calls live in `src/services/opensearchService.ts` (fetch-based; proxied by CRA dev server or `REACT_APP_OPENSEARCH_URL`).

## Customization

### Styling
- Modify CSS files in the `src/components` directory
- Global styles are in `src/App.css`
- Each component has its own CSS file

### OpenSearch Configuration
- Update connection settings in `src/services/opensearchService.ts`
- Modify search queries and filters as needed

### Security
Dev tools and selection are intentionally enabled to support open-source contributions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT

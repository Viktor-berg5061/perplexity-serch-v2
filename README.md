# Perplexity Search MCP Server

A Model Context Protocol (MCP) server that provides web search capabilities using the Perplexity API.

## Features

- Search the web using Perplexity's powerful search API
- Filter search results by recency (month, week, day, hour)
- Seamless integration with MCP-compatible AI assistants

## Prerequisites

- Node.js (v14 or higher)
- A Perplexity API key (get one from [Perplexity AI](https://www.perplexity.ai/))

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/Viktor-berg5061/perplexity-serch-v2.git
   cd perplexity-serch-v2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Perplexity API key:

   Create a `.env` file in the root directory with the following content:
   ```
   PERPLEXITY_API_KEY=your_api_key_here
   ```

   Or set it as an environment variable:
   ```bash
   export PERPLEXITY_API_KEY=your_api_key_here
   ```

## Usage

Start the MCP server:

```bash
npm start
```

Or run it directly:

```bash
node index.js
```

## Integration with MCP Settings

To use this server with an MCP-compatible AI assistant, add it to your MCP settings configuration:

```json
{
  "mcpServers": {
    "perplexity-search-v2": {
      "command": "node",
      "args": ["path/to/perplexity-serch-v2/index.js"],
      "env": {
        "PERPLEXITY_API_KEY": "your_api_key_here"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Available Tools

### search

Search the web using the Perplexity API.

**Parameters:**
- `query` (required): The search query string
- `search_recency_filter` (optional): Filter search results by recency (options: month, week, day, hour)

## License

MIT

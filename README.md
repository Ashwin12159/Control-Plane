# Telecom Operations Control Plane

A modern Next.js 14 application for managing telecom operations with region-aware gRPC integration.

## Features

- **Dark Mode Slate Theme**: Professional dark UI with slate-950 background, slate-900 cards, and blue-500 primary color
- **Region-Aware Operations**: All operations are region-specific with confirmation dialogs
- **NextAuth.js Authentication**: Secure credential-based login system
- **gRPC Integration**: Centralized gRPC client factory with dynamic region-based host selection
- **Three Main Operations**:
  - **RabbitMQ Queue Management**: Push messages to queues with sample payloads
  - **Sync Status Checking**: Check synchronization status for Practice, Location, Device, and All Bifrost
  - **Numbers Lookup**: Find numbers not in Bifrost with CSV export functionality

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js
- **Form Validation**: react-hook-form + zod
- **Notifications**: sonner
- **Icons**: lucide-react
- **gRPC**: @grpc/grpc-js + @grpc/proto-loader

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- gRPC server running (for each region)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file (copy from `.env.example`):
```bash
cp .env.example .env.local
```

4. Configure environment variables:
```env
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000

# gRPC Configuration for Regions
GRPC_AU_HOST=localhost
GRPC_AU_PORT=50051

GRPC_US_HOST=localhost
GRPC_US_PORT=50052

GRPC_UK_HOST=localhost
GRPC_UK_PORT=50053
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login

The application uses NextAuth.js with credentials provider. For demo purposes, any username/password combination will work. In production, update the `authorize` function in `lib/auth.ts` to integrate with your authentication system.

## Adding New Regions

To add a new region to the application:

### Step 1: Add Environment Variables

Add the gRPC host and port for your new region to `.env.local`:

```env
GRPC_<REGION_CODE>_HOST=your-grpc-host
GRPC_<REGION_CODE>_PORT=your-grpc-port
```

Example for Europe (EU):
```env
GRPC_EU_HOST=eu-grpc.example.com
GRPC_EU_PORT=50054
```

### Step 2: Update Region Configuration

Edit `lib/regions.ts` and add your new region to the `REGIONS` array:

```typescript
{
  code: "EU",
  name: "Europe",
  grpcHost: process.env.GRPC_EU_HOST || "localhost",
  grpcPort: parseInt(process.env.GRPC_EU_PORT || "50054", 10),
}
```

The region will automatically appear in the region selector dropdown in the header, and all operations will be region-aware.

## Project Structure

```
control-plane/
├── app/
│   ├── (auth)/              # Authentication routes
│   │   └── login/           # Login page
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── layout.tsx       # Dashboard layout with auth check
│   │   ├── page.tsx         # Dashboard home
│   │   ├── rabbitmq/        # RabbitMQ queue page
│   │   ├── check-sync/      # Sync check page
│   │   └── numbers/         # Numbers lookup page
│   ├── api/
│   │   ├── auth/            # NextAuth API routes
│   │   ├── grpc/            # gRPC API routes
│   │   │   └── [region]/    # Region-specific routes
│   │   └── regions/         # Regions API
│   └── layout.tsx           # Root layout
├── components/
│   ├── dashboard/           # Dashboard components
│   │   ├── dashboard-layout.tsx
│   │   ├── header.tsx
│   │   ├── region-selector.tsx
│   │   └── sidebar.tsx
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── grpc-client.ts       # gRPC client factory
│   ├── regions.ts           # Region configuration
│   └── utils.ts             # Utility functions
├── types/
│   └── grpc.ts              # gRPC TypeScript types
├── proto/
│   └── ops.proto            # gRPC service definition
└── middleware.ts            # NextAuth middleware
```

## API Routes

### gRPC Operations

All gRPC operations are region-aware and require a confirmation dialog:

- `POST /api/v1/[region]/push-queue` - Push message to RabbitMQ queue
- `POST /api/v1/[region]/check-sync` - Check sync status
- `POST /api/v1/[region]/numbers-not-in-bifrost` - Get numbers not in Bifrost

### Regions

- `GET /api/regions` - Get list of available regions

## gRPC Service Definition

The application expects a gRPC service defined in `proto/ops.proto` with the following methods:

- `PushToRabbitMQQueue` - Push messages to RabbitMQ
- `CheckSync` - Check synchronization status
- `GetNumbersNotInBifrost` - Get numbers not in Bifrost

## Development

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint

```bash
npm run lint
```

## Features in Detail

### Region Selector

The region selector in the header allows users to switch between regions. The selected region is:
- Stored in localStorage for persistence
- Passed to all API calls
- Displayed in confirmation dialogs

### Confirmation Dialogs

All operations show a confirmation dialog before execution, displaying the selected region to prevent accidental cross-region operations.

### Form Validation

All forms use `react-hook-form` with `zod` schemas for client-side validation. Error messages are displayed inline.

### Loading States

All operations show loading states with spinners and disabled inputs during API calls.

### Error Handling

Failed gRPC calls display user-friendly error messages via toast notifications.

## License

Private - Internal Use Only

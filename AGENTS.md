# ClearCode Repository AGENTS.md

## Project Structure
- `qr-order-api`: NestJS backend API
- `qr-order-owner`: React/Vite frontend application

## Backend (qr-order-api) Commands
- Install: `npm install`
- Dev server: `npm run start:dev`
- Prod server: `npm run start:prod`
- Lint: `npm run lint`
- Format: `npm run format`
- Test: `npm run test`
- Test coverage: `npm run test:cov`
- E2E tests: `npm run test:e2e`
- DB create: `npm run db:create`
- Seed users: `npm run seed:users`
- Fix staff: `npm run fix:staff-members`
- Migration run: `npm run migration:run`
- Migration generate: `npm run migration:generate`
- Migration revert: `npm run migration:revert`

## Frontend Owner (qr-order-owner) Commands
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Lint: `npm run lint`

## Frontend Client (qr-order-client) Commands
- Install: `flutter pub get`
- Dev web: `flutter run -d chrome`
- Dev Android: `flutter run -d emulator-5554`
- Dev iOS: `flutter run -d iPhone`
- Build: `flutter build web` / `flutter build apk` / `flutter build ios`
- Test API: `dart run test_api_connection.dart`
- Clean: `flutter clean`
- Analyze: `flutter analyze`

## Important Notes
- Backend uses NestJS with TypeORM
- Frontend Owner uses React with TypeScript and Vite
- Frontend Client uses Flutter/Dart (multi-platform: web, iOS, Android)
- Linting and formatting are configured for all projects
- Test coverage reports go to `../coverage` from backend
- Environment files: `.env` in backend root
- Client API config: `qr-order-client/lib/config/api_config.dart`
- Client connects to API at `http://localhost:3000/api/v1`
- WebSocket connects to `http://localhost:3000` (without /api/v1)
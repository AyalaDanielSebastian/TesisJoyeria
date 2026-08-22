# Azure production deploy — Laurea Joyeria
# Run after: az login

LOCATION=eastus
RG=rg-laurea-joyeria
SQL_SERVER=laurea-joyeria-sql
SQL_DB=TesisJoyeria
SQL_ADMIN=laureaadmin
# Set a strong password before running, e.g.:
# export SQL_PASSWORD='TuPasswordFuerte123!'
APP_PLAN=plan-laurea-api
APP_NAME=laurea-joyeria-api
STORAGE=laureajoyeriastg
SWA_NAME=laurea-joyeria-web

set -euo pipefail

if [ -z "${SQL_PASSWORD:-}" ]; then
  echo "Define SQL_PASSWORD antes de continuar:"
  echo "  export SQL_PASSWORD='TuPasswordFuerte123!'"
  exit 1
fi

echo "==> Resource group"
az group create -n "$RG" -l "$LOCATION"

echo "==> SQL Server + database"
az sql server create -g "$RG" -n "$SQL_SERVER" -l "$LOCATION" \
  --admin-user "$SQL_ADMIN" --admin-password "$SQL_PASSWORD"

az sql db create -g "$RG" -s "$SQL_SERVER" -n "$SQL_DB" \
  --service-objective Basic --backup-storage-redundancy Local

# Allow Azure services + your current IP for migrations
az sql server firewall-rule create -g "$RG" -s "$SQL_SERVER" \
  -n AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0

MY_IP=$(curl -s https://api.ipify.org)
az sql server firewall-rule create -g "$RG" -s "$SQL_SERVER" \
  -n AllowMyIp --start-ip-address "$MY_IP" --end-ip-address "$MY_IP"

echo "==> App Service plan + Web App (.NET 8)"
az appservice plan create -g "$RG" -n "$APP_PLAN" --sku B1 --is-linux
az webapp create -g "$RG" -p "$APP_PLAN" -n "$APP_NAME" --runtime "DOTNETCORE:8.0"

CONN="Server=tcp:${SQL_SERVER}.database.windows.net,1433;Initial Catalog=${SQL_DB};User ID=${SQL_ADMIN};Password=${SQL_PASSWORD};Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# Frontend URL placeholder — update after Static Web Apps / Vercel URL is known
FRONTEND_URL="${FRONTEND_URL:-https://localhost}"

az webapp config appsettings set -g "$RG" -n "$APP_NAME" --settings \
  ASPNETCORE_ENVIRONMENT=Production \
  ConnectionStrings__DefaultConnection="$CONN" \
  Jwt__Key="JoyeriaTesisSecretKey2026_Prod_ChangeMe_Min32!" \
  Jwt__Issuer="JoyeriaApi" \
  Jwt__Audience="JoyeriaFrontend" \
  Jwt__ExpiresInHours="8" \
  Cors__AllowedOrigins__0="$FRONTEND_URL" \
  WEBSITE_RUN_FROM_PACKAGE=1

echo "==> Storage account (comprobantes/productos)"
az storage account create -g "$RG" -n "$STORAGE" -l "$LOCATION" --sku Standard_LRS --kind StorageV2

echo ""
echo "Listo. Siguiente:"
echo "  1) Publicar API:  cd backend && dotnet publish -c Release -o ./publish"
echo "  2) Zip + deploy:  cd publish && zip -r ../api.zip . && az webapp deploy -g $RG -n $APP_NAME --src-path ../api.zip --type zip"
echo "  3) Migrar BD:     dotnet ef database update --connection \"$CONN\""
echo "  4) Frontend: Azure Static Web Apps o Vercel con VITE_API_URL=https://${APP_NAME}.azurewebsites.net"
echo "  5) Actualizar CORS con la URL real del frontend"
echo ""
echo "API URL: https://${APP_NAME}.azurewebsites.net"
echo "SQL:     ${SQL_SERVER}.database.windows.net / ${SQL_DB}"

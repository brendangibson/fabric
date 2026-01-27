# Shopify Integration

This application automatically syncs fabric inventory quantities to Shopify whenever quantities change in the system.

## How It Works

When you add a cut, add a shipment (via adding a roll), or add a hold, the application:
1. Calculates the current available quantity for that SKU
2. Updates the corresponding product variant in Shopify with the new quantity

The application is the **source of truth** for inventory quantities. Shopify inventory is updated to match the quantities stored in this app.

## Setup

### 1. Create a Shopify Custom App

1. Go to your Shopify admin panel
2. Navigate to **Settings** → **Apps and sales channels** → **Develop apps**
3. Click **Create an app**
4. Give it a name (e.g., "Fabric Inventory Sync")
5. Click **Create app**
6. Go to the **Configuration** tab
7. Under **Admin API integration**, configure the scopes:
   - `read_products` - to find products by SKU
   - `read_locations` - to get location IDs
   - `write_inventory` - to update inventory levels
   - `write_products` - (optional) to automatically enable inventory tracking if not already enabled
8. Click **Save**
9. Click **Install app** (this installs the app in your store)
10. Go to the **API credentials** tab
11. Copy the **Client ID** and **Client secret**
    - Note: You'll need both of these, not an access token
    - Important: The app must be installed (step 9) before the OAuth flow will work

### 2. Get Your Shopify Store URL

Your Shopify store URL should be in the format:
- `https://your-store-name.myshopify.com`

### 3. Get Your Location ID (Optional)

If you have multiple locations, you may want to specify which location to update:

1. Go to **Settings** → **Locations** in your Shopify admin
2. Find your location ID in the URL or use the API to list locations
3. Alternatively, the app will automatically use the first available location if not specified

### 4. Set Environment Variables

Add these environment variables to your `.env` file (for local development) or your deployment platform (Vercel, etc.):

```bash
# Required: Your Shopify store URL (without trailing slash)
SHOPIFY_STORE_URL=https://your-store-name.myshopify.com

# Required: Client ID from your custom app's API credentials
SHOPIFY_CLIENT_ID=your_client_id_here

# Required: Client secret from your custom app's API credentials
SHOPIFY_CLIENT_SECRET=your_client_secret_here

# Optional: Specific location ID to update (if not set, uses first available location)
SHOPIFY_LOCATION_ID=12345678
```

**Important Notes:**
- The app uses OAuth client credentials flow to automatically obtain access tokens
- Access tokens are cached and automatically refreshed when they expire (~24 hours)
- Never commit your client secret to version control

### 5. Enable Inventory Tracking in Shopify

**Option A: Enable manually (recommended for one-time setup)**
1. Go to **Products** in your Shopify admin
2. For each product, click on it
3. In the **Variants** section, check **Track quantity** for each variant
4. Save the product

**Option B: Enable automatically via API**
- If you added the `write_products` scope, the sync script will automatically enable inventory tracking when needed
- This is convenient but requires the additional permission

**Note:** Inventory tracking must be enabled before the app can update inventory levels. If you see "Inventory item does not have inventory tracking enabled" errors, you need to enable tracking (either manually or via API).

### 6. Verify SKU Matching

Make sure that:
- Your fabric SKUs in the `stylescolours` table match the SKUs in your Shopify product variants
- The SKU field is populated for all style/colour combinations you want to sync

## What Gets Synced

The following operations trigger a Shopify inventory update:

- ✅ **Adding a cut** - Reduces available quantity
- ✅ **Deleting a cut** - Increases available quantity
- ✅ **Adding a roll** - Increases available quantity
- ✅ **Returning a roll** - Removes roll from available quantity
- ✅ **Un-returning a roll** - Adds roll back to available quantity
- ✅ **Adding a hold** - Affects available quantity
- ✅ **Deleting a hold** - Affects available quantity
- ✅ **Updating a hold** - Affects available quantity

## Quantity Calculation

The quantity synced to Shopify is calculated as:
- Sum of all non-returned rolls' remaining length (original length minus cuts)
- Minus holds that haven't expired (holds reduce available quantity)
- Only includes rolls with remaining length > 0.5 yards (minRollSize)
- **Rounded down to the nearest 5 yards** (e.g., 28 yards → 25 yards, 24 yards → 20 yards)
- If the quantity is less than 5 yards, it's set to 0 yards
- Never communicates less than 0 yards

## Troubleshooting

### Inventory Not Updating

1. **Check environment variables**: Make sure `SHOPIFY_STORE_URL`, `SHOPIFY_CLIENT_ID`, and `SHOPIFY_CLIENT_SECRET` are set correctly
2. **Check SKU matching**: Verify the SKU in your database matches the SKU in Shopify
3. **Check API permissions**: Ensure your custom app has `write_inventory` scope configured
4. **Check app installation**: Make sure the app is installed in your store
5. **Check logs**: Look for error messages in your application logs

### Common Errors

- **"Shopify credentials not configured"**: Environment variables are missing or incomplete
- **"Shopify OAuth error"**: Check your client ID and secret, and ensure the app is installed
- **"No variant found with SKU"**: The SKU doesn't exist in Shopify or doesn't match
- **"Shopify API error"**: Check your store URL and API scopes

### Testing

To test the integration:

1. Add a cut to a roll with a known SKU
2. Check your Shopify admin to see if the inventory updated
3. Check your application logs for any errors

### Bulk Sync Script

To sync all current quantities to Shopify at once (useful for initial setup or recovery):

```bash
npm run sync-shopify
```

This script will:
- Fetch all style/colour combinations with SKUs
- Calculate the current available quantity for each
- Update Shopify inventory for each SKU
- Provide a summary of successful updates and errors

**Requirements:**
- All environment variables must be set (see Setup section)
- The script will automatically authenticate with Shopify using OAuth
- Progress is shown in real-time with success/error indicators

## API Details

The integration uses:
- **Shopify Admin API 2024-01**
- **GraphQL API** for finding product variants by SKU
- **REST API** for updating inventory levels

## Notes

- Inventory updates happen **asynchronously** after database operations complete
- If a Shopify sync fails, the database operation still succeeds (errors are logged but don't block the operation)
- Quantities are rounded to integers for Shopify (fabric quantities are stored in yards with decimals)

# Dynamic Favicon Guide

## Overview

Each dynamic page route can now have its own custom favicon. This works for both:

- **Builder routes**: `/builder/[pageId]` (editing mode)
- **Public routes**: `/[url]` (published pages)

## How It Works

### 1. Server-Side Metadata (Public Pages)

The `/app/[url]/page.tsx` uses Next.js `generateMetadata` function to set favicons:

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await Page.findOne({ url: params.url }).lean();

  return {
    icons: {
      icon: page.settings?.favicon || page.favicon || "/favicon.ico",
      shortcut: page.settings?.favicon || page.favicon || "/favicon.ico",
      apple: page.settings?.appleTouchIcon || "/apple-touch-icon.png",
    },
  };
}
```

### 2. Client-Side Update (Both Routes)

Both builder and public pages dynamically update favicons on load:

**Builder**: `/app/builder/[pageId]/page.tsx`
**Public**: `/app/[url]/PageRenderer.tsx`

```typescript
// Update favicon dynamically
const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
if (link) {
  link.href = page.favicon;
} else {
  const newLink = document.createElement("link");
  newLink.rel = "icon";
  newLink.href = page.favicon;
  document.head.appendChild(newLink);
}
```

## Page Data Structure

Your Page model should include these fields:

```typescript
{
  title: string;
  description: string;
  url: string;
  favicon?: string;  // Path or URL to favicon
  settings?: {
    favicon?: string;
    appleTouchIcon?: string;
    // Other settings...
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
    twitterImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
  };
}
```

## Priority Order

The system checks for favicons in this order:

1. `page.settings.favicon` (preferred)
2. `page.favicon` (fallback)
3. `/favicon.ico` (default)

## Adding Favicon to Page Builder

### Step 1: Update Page Model

Add favicon field to your Mongoose model:

```typescript
// models/pages.ts
const PageSchema = new Schema({
  // ... existing fields
  favicon: { type: String, required: false },
  settings: {
    favicon: { type: String, required: false },
    appleTouchIcon: { type: String, required: false },
    // ... other settings
  },
});
```

### Step 2: Add Favicon Input to PageMetaModal

Update `SimplePageBuilder.tsx` PageMetaModal component:

```typescript
// Add state
const [pageFavicon, setPageFavicon] = useState("");

// Add input field in the modal
<div>
  <label className="mb-1.5 block text-[12px] font-bold text-neutral-700">
    آیکون صفحه (Favicon)
  </label>
  <input
    type="text"
    value={pageFavicon}
    onChange={(e) => setPageFavicon(e.target.value)}
    placeholder="https://example.com/favicon.ico"
    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[14px]..."
  />
  <p className="mt-1.5 text-[11px] text-neutral-400">
    آدرس کامل فایل آیکون (ICO, PNG, SVG)
  </p>
</div>

// Update save request
body: JSON.stringify({
  title: pageTitle,
  url: pageUrl,
  description: pageDescription,
  favicon: pageFavicon,
  blocks,
  // ... rest
})
```

### Step 3: Add Favicon Uploader (Optional)

For file upload instead of URL:

```typescript
// Add file input
<input
  type="file"
  accept="image/x-icon,image/png,image/svg+xml"
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setPageFavicon(data.url);
    }
  }}
/>
```

## Testing

### Test Builder Route:

1. Edit a page: `/builder/[pageId]`
2. Open browser dev tools → Elements tab
3. Check `<link rel="icon">` in `<head>`
4. Should show custom favicon

### Test Public Route:

1. Visit published page: `/[url]`
2. Check browser tab icon
3. Should show custom favicon

### Test Multiple Tabs:

1. Open multiple pages in different tabs
2. Each tab should show its own favicon

## Supported Formats

- `.ico` (recommended for broad support)
- `.png` (modern browsers)
- `.svg` (modern browsers)

## Best Practices

1. **Size**: Use 32x32px or 64x64px for optimal display
2. **Format**: ICO for maximum compatibility
3. **Storage**: Upload to your CDN or `/public` folder
4. **Naming**: Use descriptive names like `page-123-favicon.ico`
5. **Fallback**: Always provide default `/favicon.ico`

## Troubleshooting

### Favicon not updating?

- Clear browser cache (Ctrl+Shift+Delete)
- Hard reload (Ctrl+F5)
- Check browser console for 404 errors
- Verify favicon URL is accessible

### Different favicon on mobile?

- Add apple-touch-icon for iOS devices
- Size: 180x180px PNG

### Favicon shows old version?

- Browsers cache favicons aggressively
- Add version query: `/favicon.ico?v=2`
- Or use unique filenames

## Example Implementation

```typescript
// Complete page with custom favicon
const page = {
  title: "فروشگاه من",
  url: "my-shop",
  description: "بهترین محصولات",
  favicon: "https://cdn.example.com/shop-icon.ico",
  settings: {
    favicon: "https://cdn.example.com/shop-icon.ico",
    appleTouchIcon: "https://cdn.example.com/shop-icon-180.png",
  },
  blocks: [
    /* ... */
  ],
};
```

## Future Enhancements

- [ ] Add favicon preview in page builder
- [ ] Support multiple sizes (manifest.json)
- [ ] Auto-generate from logo
- [ ] Theme color customization
- [ ] PWA icon support

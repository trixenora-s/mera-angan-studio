@echo off

echo Creating folder structure...

:: App routes
mkdir app\events\[category]
mkdir app\product\[id]
mkdir app\gallery
mkdir app\contact
mkdir app\about
mkdir app\auth\login
mkdir app\auth\signup
mkdir app\profile\orders
mkdir app\profile\wishlist
mkdir app\profile\addresses
mkdir app\profile\notifications
mkdir app\cart
mkdir app\checkout\success
mkdir app\search

:: Components
mkdir components\layout
mkdir components\home
mkdir components\events
mkdir components\product
mkdir components\cart
mkdir components\checkout
mkdir components\auth
mkdir components\profile
mkdir components\ui

:: Other folders
mkdir lib
mkdir hooks
mkdir types
mkdir constants

echo Creating files...

:: App files
type nul > app\layout.tsx
type nul > app\page.tsx
type nul > app\events\[category]\page.tsx
type nul > app\product\[id]\page.tsx
type nul > app\gallery\page.tsx
type nul > app\contact\page.tsx
type nul > app\about\page.tsx
type nul > app\auth\login\page.tsx
type nul > app\auth\signup\page.tsx
type nul > app\profile\page.tsx
type nul > app\profile\orders\page.tsx
type nul > app\profile\wishlist\page.tsx
type nul > app\profile\addresses\page.tsx
type nul > app\profile\notifications\page.tsx
type nul > app\cart\page.tsx
type nul > app\checkout\page.tsx
type nul > app\checkout\success\page.tsx
type nul > app\search\page.tsx

:: Layout components
type nul > components\layout\Header.tsx
type nul > components\layout\Footer.tsx
type nul > components\layout\MobileNav.tsx

:: Home components
type nul > components\home\HeroSection.tsx
type nul > components\home\EventCategoriesGrid.tsx
type nul > components\home\FeaturedPackages.tsx
type nul > components\home\TestimonialsCarousel.tsx
type nul > components\home\StatsCounter.tsx

:: Events
type nul > components\events\ProductCard.tsx
type nul > components\events\ProductGrid.tsx
type nul > components\events\FilterSidebar.tsx
type nul > components\events\SortDropdown.tsx
type nul > components\events\RatingStars.tsx
type nul > components\events\PriceDisplay.tsx

:: Product
type nul > components\product\ProductGallery.tsx
type nul > components\product\PackageDetails.tsx
type nul > components\product\ReviewSection.tsx
type nul > components\product\AddToCartButton.tsx
type nul > components\product\WishlistButton.tsx

:: Cart
type nul > components\cart\CartItem.tsx
type nul > components\cart\OrderSummary.tsx
type nul > components\cart\CouponInput.tsx

:: Checkout
type nul > components\checkout\AddressForm.tsx
type nul > components\checkout\PaymentSection.tsx
type nul > components\checkout\OrderConfirmation.tsx

:: Auth
type nul > components\auth\GoogleSignInButton.tsx
type nul > components\auth\PhoneOTPForm.tsx

:: Profile
type nul > components\profile\ProfileInfo.tsx
type nul > components\profile\OrderCard.tsx
type nul > components\profile\WishlistGrid.tsx
type nul > components\profile\AddressCard.tsx
type nul > components\profile\NotificationItem.tsx

:: UI
type nul > components\ui\SearchBar.tsx
type nul > components\ui\Dropdown.tsx
type nul > components\ui\Modal.tsx
type nul > components\ui\Toast.tsx
type nul > components\ui\Skeleton.tsx
type nul > components\ui\Badge.tsx
type nul > components\ui\Breadcrumb.tsx

:: Lib files
type nul > lib\supabase.ts
type nul > lib\auth.ts
type nul > lib\razorpay.ts
type nul > lib\search.ts
type nul > lib\validations.ts

:: Hooks
type nul > hooks\useCart.ts
type nul > hooks\useWishlist.ts
type nul > hooks\useAuth.ts
type nul > hooks\useSearch.ts

:: Types
type nul > types\index.ts

:: Constants
type nul > constants\eventCategories.ts
type nul > constants\routes.ts

:: Environment file
echo NEXT_PUBLIC_SUPABASE_URL= > .env.example
echo NEXT_PUBLIC_SUPABASE_ANON_KEY= >> .env.example
echo NEXTAUTH_SECRET= >> .env.example
echo NEXTAUTH_URL=http://localhost:3000 >> .env.example
echo RAZORPAY_KEY_ID= >> .env.example
echo RAZORPAY_KEY_SECRET= >> .env.example

echo Setup complete!
echo Run the project with:
echo cd my-app
echo npm run dev

pause
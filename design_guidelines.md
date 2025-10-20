# Berry Quality Inspector - Design Guidelines

## Design Approach
**Utility-Focused Application** - Function-first design system optimized for field data collection, mobile efficiency, and administrative workflows. Primary focus on usability, clarity, and speed of task completion.

## Core Design Principles
- **Compact & Efficient**: Maximize visible content with tight spacing
- **Role-Adaptive**: Interface elements adjust based on user role (Admin, Supervisor, Analyst, Promoter)
- **Mobile-First**: Primary users are field promoters on mobile devices
- **Quick Actions**: Surface most common tasks prominently

## Color Palette

### Light Mode
- **Primary Purple**: 265 80% 60% - Buttons, links, highlights, active states
- **Success Green**: 142 71% 45% - Completed evaluations, positive metrics
- **Destructive Red**: 0 84% 60% - Alerts, errors, critical actions
- **Background**: 0 0% 100% - Main background
- **Card**: 0 0% 98% - Cards and containers
- **Border**: 220 13% 91% - Dividers and borders
- **Text Primary**: 222 47% 11% - Main text
- **Text Secondary**: 215 16% 47% - Secondary text, labels
- **Muted**: 210 40% 96% - Disabled elements

### Dark Mode (Auto-inverted)
- **Background**: 222 47% 11% - Dark base
- **Card**: 217 33% 17% - Slightly lighter than background
- **Border**: 215 25% 27% - Subtle borders
- **Text Primary**: 0 0% 98% - Main text
- **Text Secondary**: 215 20% 65% - Secondary text

### Accent Colors & Gradients
- **Purple-Blue-Teal Gradient**: Applied to login background, hero cards, key metric displays
  - Purple: 270 70% 60% (left)
  - Blue: 240 70% 55% (middle)
  - Teal: 180 60% 50% (right)
- **Primary Gradient**: Used for titles and special highlights
  - From: 270 70% 60%
  - Via: 265 80% 60%
  - To: 240 70% 55%

## Typography
- **Font Family**: System fonts via Tailwind defaults (`font-sans`)
- **Headings**: 
  - H1: text-3xl font-bold (Dashboard titles)
  - H2: text-2xl font-semibold (Section headers)
  - H3: text-xl font-semibold (Card headers)
- **Body**: text-base (Forms, content)
- **Small**: text-sm (Labels, metadata)
- **Tiny**: text-xs (Timestamps, auxiliary info)

## Layout System

### Spacing Units
Use Tailwind spacing: **2, 3, 4, 6, 8, 12, 16** for consistent rhythm
- **Compact Mobile**: p-3, gap-3, space-y-3
- **Desktop**: p-6, gap-6, space-y-6
- **Section Padding**: py-8 md:py-12
- **Card Padding**: p-4 md:p-6

### Grid System
- **Dashboard Metrics**: grid-cols-2 md:grid-cols-4 gap-4
- **Berry Cards**: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3
- **Admin Tables**: Single column with responsive overflow
- **Store List**: Single column cards with gap-3

### Container Widths
- **Dashboard/Main**: max-w-7xl mx-auto
- **Forms**: max-w-2xl mx-auto
- **Admin Tables**: w-full with horizontal scroll on mobile

## Component Library

### Navigation
- **Desktop**: Fixed sidebar (w-64), logo top, nav items middle, user info bottom
- **Mobile**: Hamburger menu, full-screen overlay with dark backdrop
- **Highlight Active**: bg-primary/10 text-primary with left border accent

### Cards
- **Base**: Rounded corners (rounded-lg), subtle shadow (shadow-sm), border (border)
- **Metric Cards**: Gradient background for hero metrics, icon + value + label layout
- **Product Cards (BerryCard)**: Colorful backgrounds per berry type, hover lift effect, icon centered

### Buttons
- **Primary**: bg-primary text-white, hover brightness increase
- **Secondary**: border border-primary text-primary, hover bg-primary/5
- **Destructive**: bg-red text-white
- **Sizes**: Regular (px-4 py-2), Small (px-3 py-1.5), Large (px-6 py-3)
- **On Images**: Blurred background (backdrop-blur-sm bg-white/20)

### Forms
- **Input Fields**: border rounded-md px-3 py-2, focus ring-2 ring-primary
- **Labels**: text-sm font-medium mb-1
- **Required Fields**: Red asterisk
- **Photo Upload**: Dashed border, camera icon, tap area
- **Select Dropdowns**: Native styling with chevron icon

### Progress Indicators
- **Step Progress**: Horizontal bar showing 1-5 steps, circles for each step, filled for completed
- **Loading**: Spinner using primary color

### Data Visualization
- **Charts**: Line/bar charts for trends, use primary blue and success green
- **Filters**: Compact button group or dropdown selectors
- **Export**: Icon button in top-right of reports

### Status Badges
- **Completed**: Green background, check icon
- **Pending**: Yellow background, clock icon
- **Incomplete**: Red background, alert icon
- **Rounded**: rounded-full px-2 py-1 text-xs

## Iconography
- **Library**: Lucide React icons via CDN
- **Sizes**: 16px (small), 20px (default), 24px (large)
- **Usage**: Navigation items, buttons, status indicators, product cards

## Photo Documentation
- **Upload Areas**: Large tap targets (min 120px height)
- **Preview**: Thumbnail grid showing uploaded photos
- **Quality Guidelines**: Text hints for optimal photo angles

## Responsive Breakpoints
- **Mobile**: < 768px (base Tailwind)
- **Tablet**: 768px - 1024px (md:)
- **Desktop**: > 1024px (lg:)

## Images
**No hero images** - This is a utility application focused on data collection and admin tasks. Images appear only as:
- Photo uploads within evaluation workflow (user-captured)
- Product icons for berry types
- User avatars (optional, initials fallback)

## Accessibility
- **Dark Mode**: Fully supported with optimized contrast
- **Touch Targets**: Minimum 44px for mobile interactions
- **Focus States**: Visible ring indicators on keyboard navigation
- **Form Validation**: Clear error messages below fields
- **Color Contrast**: WCAG AA compliant for all text

## Animation
- **Minimal**: Subtle hover effects on cards (scale 1.02)
- **Transitions**: Smooth 150ms for state changes
- **No**: Distracting parallax, auto-playing animations, complex scroll effects

## Special Considerations
- **Offline Capability**: Visual indicators for sync status
- **Geolocation**: Map pin icon for store location validation
- **Quick Actions**: Large buttons on dashboard for "New Evaluation"
- **Admin Density**: Tables with compact rows, sticky headers
- **Photo Storage**: Progressive JPEG compression, thumbnail generation
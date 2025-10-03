# Routes Documentation for Piped Application

## English Documentation

### Complete List of Routes in the Piped Application

1. **`/` (Home)** - Shows the Trending page where users can see trending videos. This serves as the main landing page of the application.

2. **`/trending` (Trending)** - Displays trending videos based on region. The page fetches trending content from the API and shows them in a grid layout.

3. **`/preferences` (Preferences)** - A settings page where users can customize their experience with various options like theme, playback preferences, and content filters.

4. **`/results` (SearchResults)** - Pages that displays search results when users search for videos, channels, or playlists using the search functionality.

5. **`/playlist` (Playlist)** - Shows a specific playlist with all its videos. This route likely handles both viewing existing playlists and creating new ones.

6. **`/:path(v|w|embed|live|shorts|watch)/:v?` (WatchVideo)** - A versatile video watching route that supports multiple URL patterns (v, w, embed, live, shorts, watch) followed by an optional video ID parameter. This is the main route for watching videos.

7. **`/watch_videos` (WatchVideos)** - Another route for watching videos, likely used for watching multiple videos or specific video collections.

8. **`/clip/:clipId` (Clips)** - Shows a specific video clip identified by its clip ID, used for short-form content or specific segments of videos.

9. **`/:path(channel|user|c)/:channelId/:videos?` (Channel)** - Channel page that supports multiple aliases (channel, user, c) to access a specific channel by its ID, with an optional videos parameter to filter content.

10. **`/@:channelId` (Channel handle)** - A handle-based channel access route that allows users to visit channels using @handles (like @PewDiePie).

11. **`/login` (Login)** - The user login page where existing users can sign in to their accounts.

12. **`/register` (Register)** - The user registration page where new users can create accounts.

13. **`/feed` (alias: `/feed/subscriptions`) (Feed)** - The user's personalized feed showing videos from subscribed channels, with an alias for subscription-specific content.

14. **`/import` (Import)** - A page that allows users to import subscriptions, likely from other platforms like YouTube.

15. **`/:videoId([a-zA-Z0-9_-]{11})` (VideoRedirect)** - A route that handles 11-character video IDs (like YouTube's format), redirecting to the proper watch page for the video.

16. **`/subscriptions` (Subscriptions)** - Shows the list of channels that the user is subscribed to.

17. **`/history` (Watch History)** - A page that displays the user's watch history, showing videos they've previously watched.

18. **`/playlists` (Playlists)** - Lists the user's created or saved playlists.

19. **`/:pathMatch(.*)*` (Page Not Found)** - A catch-all route that handles 404 errors for any unmatched URLs, showing a "Page Not Found" message.

---

## مستندات فارسی

### فهرست کامل مسیرها در برنامه پایپد

1. **`/` (خانه)** - صفحه ترند را نشان می‌دهد که کاربران می‌توانند ویدیوهای پرطرفدار را ببینند. این صفحه به عنوان صفحه اصلی برنامه عمل می‌کند.

2. **`/trending` (ترند)** - ویدیوهای پرطرفدار را بر اساس منطقه نمایش می‌دهد. این صفحه محتوای پرطرفدار را از API دریافت می‌کند و آنها را در یک چیدمان شبکه‌ای نشان می‌دهد.

3. **`/preferences` (تنظیمات)** - صفحه تنظیماتی که کاربران می‌توانند با گزینه‌های مختلفی مانند تم، ترجیحات پخش و فیلترهای محتوا تجربه خود را سفارشی کنند.

4. **`/results` (نتایج جستجو)** - صفحاتی که نتایج جستجو را زمانی که کاربران برای ویدیوها، چنل‌ها یا لیست‌های پخش از طریق عملکرد جستجو جستجو می‌کنند، نمایش می‌دهد.

5. **`/playlist` (لیست پخش)** - یک لیست پخش خاص را با تمام ویدیوهای آن نشان می‌دهد. این مسیر احتمالاً هم برای مشاهده لیست‌های پخش موجود و هم برای ایجاد موارد جدید کار می‌کند.

6. **`/:path(v|w|embed|live|shorts|watch)/:v?` (تماشای ویدیو)** - یک مسیر چندمنظوره برای تماشای ویدیو که از چند الگوی URL پشتیبانی می‌کند (v، w، embed، live، shorts، watch) که توسط یک پارامتر اختیاری شناسه ویدیو پیروی می‌شود. این مسیر اصلی برای تماشای ویدیوها است.

7. **`/watch_videos` (تماشای ویدیوها)** - مسیر دیگری برای تماشای ویدیوها، احتمالاً برای تماشای چند ویدیو یا مجموعه‌های ویدیویی خاص استفاده می‌شود.

8. **`/clip/:clipId` (کلیپ‌ها)** - یک ویدیوی کلیپ خاص را با شناسه کلیپ آن نشان می‌دهد، برای محتوای کوتاه یا بخش‌های خاص ویدیوها استفاده می‌شود.

9. **`/:path(channel|user|c)/:channelId/:videos?` (چنل)** - صفحه چنل که از چند نام مستعار پشتیبانی می‌کند (channel، user، c) تا با شناسه چنل خاص دسترسی پیدا کند، با یک پارامتر اختیاری برای فیلتر کردن محتوا.

10. **`/@:channelId` (نام کاربری چنل)** - یک مسیر دسترسی به چنل بر اساس نام کاربری که به کاربران امکان می‌دهد چنل‌ها را با استفاده از @نام کاربری (مانند @PewDiePie) بازدید کنند.

11. **`/login` (ورود)** - صفحه ورود کاربر که کاربران موجود می‌توانند به حساب‌هایشان وارد شوند.

12. **`/register` (ثبت نام)** - صفحه ثبت نام کاربر که کاربران جدید می‌توانند حساب ایجاد کنند.

13. **`/feed` (نام مستعار: `/feed/subscriptions`) (فید)** - فید شخصی کاربر که ویدیوهای چنل‌های مشترک شده را نشان می‌دهد، با یک نام مستعار برای محتوای مخصوص مشترک‌ها.

14. **`/import` (وارد کردن)** - صفحه‌ای که به کاربران امکان وارد کردن اشتراک‌ها را می‌دهد، احتمالاً از پلتفرم‌های دیگر مانند یوتیوب.

15. **`/:videoId([a-zA-Z0-9_-]{11})` (تغییر مسیر ویدیو)** - مسیری که شناسه‌های 11 کاراکتری ویدیو (مانند فرمت یوتیوب) را مدیریت می‌کند و به صفحه تماشای ویدیو مناسب تغییر مسیر می‌دهد.

16. **`/subscriptions` (اشتراک‌ها)** - فهرست چنل‌هایی که کاربر در آنها مشترک شده است را نشان می‌دهد.

17. **`/history` (تاریخچه تماشا)** - صفحه‌ای که تاریخچه تماشای کاربر را نمایش می‌دهد، ویدیوهایی که قبلاً تماشا کرده است نشان می‌دهد.

18. **`/playlists` (لیست‌های پخش)** - لیست لیست‌های پخش ایجاد شده یا ذخیره شده توسط کاربر را نمایش می‌دهد.

19. **`/:pathMatch(.*)*` (صفحه یافت نشد)** - یک مسیر همه‌کاره که خطاها را در مورد URLهای نامatching مدیریت می‌کند و پیام "صفحه یافت نشد" را نمایش می‌دهد.
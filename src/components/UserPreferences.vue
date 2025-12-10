<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center mb-6">
      <router-link to="/user/gust" class="btn btn-secondary ml-4">
        <i class="i-fa6-solid:arrow-left"></i>
      </router-link>
      <h1 class="text-2xl font-bold" v-t="'titles.preferences'">تنظیمات</h1>
    </div>

    <!-- Appearance Settings -->
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.appearance'">ظاهر</h2>

      <div class="grid grid-cols-1 gap-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex flex-col gap-2 w-full sm:w-64">
            <label class="pref block font-semibold" for="selectTheme" v-t="'actions.theme'">تم</label>
            <select
              id="selectTheme"
              v-model="selectedTheme"
              class="select w-full"
              @change="onChange"
              :disabled="isThemeSelectorDisabled"
            >
              <option value="auto" v-t="'actions.auto'">خودکار</option>
              <option value="dark" v-t="'titles.dark_theme'">تیره</option>
              <option value="light" v-t="'titles.light_theme'">روشن</option>
            </select>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.theme_description'">
              تم تاریک: مناسب محیط‌های کم نور / تم روشن: مناسب محیط‌های پر نور
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex flex-col gap-2 w-full sm:w-64">
            <label class="pref block font-semibold" for="selectHomepage" v-t="'actions.default_homepage'">صفحه اصلی پیش‌فرض</label>
            <select
              id="selectHomepage"
              v-model="defaultHomepage"
              class="select w-full"
              @change="onChange"
            >
              <option value="trending" v-t="'titles.trending'">پرطرفدار</option>
              <option value="feed" v-t="'titles.feed'">فید</option>
            </select>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.homepage_description'">
              تعیین کننده صفحه‌ای که پس از ورود به سایت به آن هدایت می‌شوید
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Player Settings -->
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.player'">پخش کننده</h2>

      <div class="grid grid-cols-1 gap-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex flex-col gap-2 w-full sm:w-64">
            <label class="pref block font-semibold" for="selectQuality" v-t="'actions.default_quality'">کیفیت پیش‌فرض</label>
            <select
              id="selectQuality"
              v-model="defaultQuality"
              class="select w-full"
              @change="onChange"
            >
              <option value="0" v-t="'actions.auto'">خودکار</option>
              <option value="144">144p</option>
              <option value="240">240p</option>
              <option value="360">360p</option>
              <option value="480">480p</option>
              <option value="720">720p</option>
              <option value="1080">1080p</option>
              <option value="1440">1440p</option>
              <option value="2160">2160p</option>
            </select>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.quality_description'">
              کیفیت ویدیویی که به طور پیش‌فرض هنگام باز کردن ویدیوها انتخاب می‌شود
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex flex-col gap-2 w-full sm:w-64">
            <label class="pref block font-semibold" for="selectSpeed" v-t="'titles.default_speed'">سرعت پیش‌فرض</label>
            <select
              id="selectSpeed"
              v-model="defaultSpeed"
              class="select w-full"
              @change="onChange"
            >
              <option value="0.25">0.25x</option>
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1.0">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="1.75">1.75x</option>
              <option value="2.0">2.0x</option>
            </select>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.speed_description'">
              سرعت پخش پیش‌فرض ویدیوها هنگام شروع
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkAutoplay"
              v-model="autoplay"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
            />
            <label class="pref font-semibold" for="chkAutoplay" v-t="'actions.autoplay'">پخش خودکار</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.autoplay_description'">
              پخش خودکار ویدیوی بعدی هنگام پایان یافتن ویدیو فعلی
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkAutoDisplayCaptions"
              v-model="autoDisplayCaptions"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
            />
            <label class="pref font-semibold" for="chkAutoDisplayCaptions" v-t="'actions.auto_display_captions'">نمایش خودکار زیرنویس</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.auto_display_captions_description'">
              به طور خودکار زیرنویس ویدیو را نمایش می‌دهد
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex flex-col gap-2 w-full sm:w-64">
            <label class="pref block font-semibold" for="txtAutoplayNextCountdown" v-t="'actions.autoplay_next_countdown'">زمان شمارش معکوس پخش خودکار بعدی</label>
            <input
              id="txtAutoplayNextCountdown"
              v-model.number="autoPlayNextCountdown"
              class="input w-full"
              type="number"
              min="0"
              @change="onChange"
            />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.autoplay_next_countdown_description'">
              تعداد ثانیه قبل از پخش خودکار ویدیو بعدی
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkAudioOnly"
              v-model="listen"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
            />
            <label class="pref font-semibold" for="chkAudioOnly" v-t="'actions.audio_only'">فقط صدا</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.audio_only_description'">
              پخش فقط صدای ویدیو بدون تصویر
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkPreferHls"
              v-model="preferHls"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
            />
            <label class="pref font-semibold" for="chkPreferHls" v-t="'actions.prefer_hls'">اولویت HLS</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.prefer_hls_description'">
              اولویت استفاده از جریان HLS به جای دیگر فرمت‌ها
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex flex-col gap-2 w-full sm:w-64">
            <label class="pref block font-semibold" for="txtBufferingGoal" v-t="'actions.buffering_goal'">هدف بافرگذاری</label>
            <input
              id="txtBufferingGoal"
              v-model="bufferingGoal"
              class="input w-full"
              type="text"
              @change="onChange"
            />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.buffering_goal_description'">
              مقدار هدف بافرگذاری به ثانیه (معمولاً 10)
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkMinimizeComments"
              v-model="minimizeComments"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
            />
            <label class="pref font-semibold" for="chkMinimizeComments" v-t="'actions.minimize_comments'">کوچک کردن دیدگاه‌ها</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.minimize_comments_description'">
              دیدگاه‌ها را در حالت بسته به طور پیش‌فرض نشان می‌دهد
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkMinimizeDescription"
              v-model="minimizeDescription"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
            />
            <label class="pref font-semibold" for="chkMinimizeDescription" v-t="'actions.minimize_description'">کوچک کردن توضیحات</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.minimize_description_description'">
              توضیحات ویدیو را در حالت بسته به طور پیش‌فرض نشان می‌دهد
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkMinimizeRecommendations"
              v-model="minimizeRecommendations"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
            />
            <label class="pref font-semibold" for="chkMinimizeRecommendations" v-t="'actions.minimize_recommendations'">کوچک کردن پیشنهادها</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.minimize_recommendations_description'">
              لیست پیشنهادهای ویدیو را در حالت بسته به طور پیش‌فرض نشان می‌دهد
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkMinimizeChapters"
              v-model="minimizeChapters"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
            />
            <label class="pref font-semibold" for="chkMinimizeChapters" v-t="'actions.minimize_chapters'">کوچک کردن فصل‌ها</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.minimize_chapters_description'">
              لیست فصل‌های ویدیو را در حالت بسته به طور پیش‌فرض نشان می‌دهد
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Display Settings -->
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.display'">نمایش</h2>

      <div class="grid grid-cols-1 gap-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex flex-col gap-2 w-full sm:w-64">
            <label class="pref block font-semibold" for="selectChapterLayoutMobile" v-t="'actions.chapters_layout_mobile'">چیدمان فصل در موبایل</label>
            <select
              id="selectChapterLayoutMobile"
              v-model="mobileChapterLayout"
              class="select w-full"
              @change="onChange"
            >
              <option value="Horizontal" v-t="'video.chapters_horizontal'">افقی</option>
              <option value="Vertical" v-t="'video.chapters_vertical'">عمودی</option>
            </select>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.chapter_layout_description'">
              نحوه نمایش فصل‌های ویدیو در نسخه موبایل
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkShowWatchOnYouTube"
              v-model="showWatchOnYouTube"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
              :disabled="isWatchOnYouTubeDisabled"
            />
            <label class="pref font-semibold" for="chkShowWatchOnYouTube" v-t="'actions.show_watch_on_youtube'">نمایش دکمه تماشای روی یوتیوب</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.show_watch_on_youtube_description'">
              نمایش دکمه برای تماشای ویدیو در یوتیوب اصلی
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkShowSearchSuggestions"
              v-model="searchSuggestions"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
              :disabled="isSearchSuggestionsDisabled"
            />
            <label class="pref font-semibold" for="chkShowSearchSuggestions" v-t="'actions.show_search_suggestions'">نمایش پیشنهادات جستجو</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.show_search_suggestions_description'">
              نمایش پیشنهادات جستجو هنگام تایپ کردن
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkHideDislikedVideos"
              v-model="hideDislikedVideos"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
            />
            <label class="pref font-semibold" for="chkHideDislikedVideos" v-t="'actions.hide_disliked_videos'">پنهان کردن ویدیوهای ناپسندیده شده</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.hide_disliked_videos_description'">
              ویدیوهایی که ناپسندیده اند را در نمایش مخفی می‌کند
            </p>
          </div>
        </div>

        <div v-if="hideDislikedVideos" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkShowAlertOnDislikedVideos"
              v-model="showAlertOnDislikedVideos"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
            />
            <label class="pref font-semibold" for="chkShowAlertOnDislikedVideos" v-t="'actions.show_alert_on_disliked_videos'">نمایش هشدار برای ویدیوهای ناپسندیده شده</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.show_alert_on_disliked_videos_description'">
              نمایش هشدار هنگام مشاهده ویدیوهای ناپسندیده شده
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Storage Settings -->
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.storage'">ذخیره‌سازی</h2>

      <div class="grid grid-cols-1 gap-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkStoreWatchHistory"
              v-model="watchHistory"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
              :disabled="isWatchHistoryStorageDisabled"
            />
            <label class="pref font-semibold" for="chkStoreWatchHistory" v-t="'actions.store_watch_history'">ذخیره تاریخچه تماشا</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.watch_history_description'">
              ویدیوهای تماشا شده توسط شما را در مرورگر ذخیره می‌کند
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkStoreSearchHistory"
              v-model="searchHistory"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
              :disabled="isSearchHistoryStorageDisabled"
            />
            <label class="pref font-semibold" for="chkStoreSearchHistory" v-t="'actions.store_search_history'">ذخیره تاریخچه جستجو</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.search_history_description'">
              عبارات جستجوی شما را در مرورگر ذخیره می‌کند
            </p>
          </div>
        </div>

        <div v-if="watchHistory" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkHideWatched"
              v-model="hideWatched"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
            />
            <label class="pref font-semibold" for="chkHideWatched" v-t="'actions.hide_watched'">پنهان کردن تماشا شده‌ها</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.hide_watched_description'">
              ویدیوهایی که قبلاً تماشا کرده‌اید را در نمایش مخفی می‌کند
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkLogUserActivity"
              v-model="logUserActivity"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
            />
            <label class="pref font-semibold" for="chkLogUserActivity" v-t="'actions.log_user_activity'">ثبت فعالیت‌های کاربر</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.log_user_activity_description'">
              ثبت فعالیت‌های شما در مرورگر برای نمایش در داشبورد کاربر
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Privacy and Integration Settings -->
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.privacy_integrations'">حریم خصوصی و یکپارچه‌سازی‌ها</h2>

      <div class="grid grid-cols-1 gap-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex flex-col gap-2 w-full sm:w-64">
            <label class="pref block font-semibold" for="selectProxySetting" v-t="'actions.proxy_setting'">تنظیمات پروکسی</label>
            <select
              id="selectProxySetting"
              v-model="proxySetting"
              class="select w-full"
              @change="onChange"
            >
              <option value="none" v-t="'actions.no_proxy'">بدون پروکسی</option>
              <option value="hetzner" v-t="'actions.hetzner_proxy'">هتزنر</option>
              <option value="asiatech" v-t="'actions.asiatech_proxy'">آسیاتک</option>
            </select>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.proxy_setting_description'">
              انتخاب نوع پروکسی برای دور زدن محدودیت‌ها
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex flex-col gap-2 w-full sm:w-64">
            <label class="pref block font-semibold" for="txtPrefetchLimit" v-t="'actions.concurrent_prefetch_limit'">محدودیت واکشی هم‌زمان</label>
            <input
              id="txtPrefetchLimit"
              v-model="prefetchLimit"
              class="input w-full"
              type="text"
              @change="onChange"
              :disabled="isPrefetchLimitDisabled"
            />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.prefetch_limit_description'">
              تعداد ویدیوهایی که به طور هم‌زمان واکشی می‌شوند
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkDisableLBRY"
              v-model="disableLBRY"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
              :disabled="isLBRYIntegrationDisabled"
            />
            <label class="pref font-semibold" for="chkDisableLBRY" v-t="'actions.disable_lbry'">غیرفعال کردن LBRY</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.disable_lbry_description'">
              غیرفعال کردن یکپارچه‌سازی LBRY و اضافه کردن لینک‌های OpenDLC
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkEnableLBRYProxy"
              v-model="proxyLBRY"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
              :disabled="isLBRYProxyDisabled"
            />
            <label class="pref font-semibold" for="chkEnableLBRYProxy" v-t="'actions.enable_lbry_proxy'">فعال کردن پروکسی LBRY</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.enable_lbry_proxy_description'">
              استفاده از پروکسی برای دسترسی به API LBRY
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- SponsorBlock Integration -->
    <div v-if="!isSponsorBlockDisabled" class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.sponsorblock'">SponsorBlock</h2>
      <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
        <span v-t="'actions.uses_api_from'" /> <a class="link" href="https://sponsor.ajay.app/">sponsor.ajay.app</a>
      </p>

      <div class="grid grid-cols-1 gap-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkEnableSponsorblock"
              v-model="sponsorBlock"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
            />
            <label class="pref font-semibold" for="chkEnableSponsorblock" v-t="'actions.enable_sponsorblock'">فعال کردن SponsorBlock</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.sponsorblock_description'">
              عدم نمایش بخش‌های اختیاری ویژه تبلیغات، معرفی، و دیگر موارد
            </p>
          </div>
        </div>

        <div v-if="sponsorBlock">
          <div class="mb-4">
            <h3 class="text-lg font-semibold mb-3" v-t="'titles.skip_options'">گزینه‌های پرش</h3>
            <div class="space-y-3">
              <div v-for="[name, item] in skipOptions" :key="name" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div class="flex flex-col gap-2 w-full sm:w-64">
                  <label class="pref block font-semibold" :for="'ddlSkip_' + name">{{ $t(item.label) }}</label>
                  <select
                    :id="'ddlSkip_' + name"
                    v-model="item.value"
                    class="select w-full"
                    @change="onChange"
                  >
                    <option value="no" v-t="'actions.no'">خیر</option>
                    <option value="button" v-t="'actions.skip_button_only'">فقط دکمه</option>
                    <option value="auto" v-t="'actions.skip_automatically'">خودکار</option>
                  </select>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ getTooltipByActionLabel(item.label) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div class="flex items-center">
              <input
                id="chkShowMarkers"
                v-model="showMarkers"
                type="checkbox"
                class="checkbox ml-2"
                @change="onChange"
              />
              <label class="pref font-semibold" for="chkShowMarkers" v-t="'actions.show_markers'">نمایش نشانه‌ها</label>
            </div>
            <div class="flex-1">
              <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.show_markers_description'">
                نمایش نشانه‌های زمان برای قسمت‌های تبلیغاتی در نوار پیشرفت
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div class="flex flex-col gap-2 w-full sm:w-64">
              <label class="pref block font-semibold" for="txtMinSegmentLength" v-t="'actions.min_segment_length'">حداقل طول قطعه</label>
              <input
                id="txtMinSegmentLength"
                v-model="minSegmentLength"
                class="input w-full"
                type="text"
                @change="onChange"
              />
            </div>
            <div class="flex-1">
              <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.min_segment_length_description'">
                حداقل طول قطعه تبلیغ برای نادیده گرفتن آن (ثانیه)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DeArrow Integration -->
    <div v-if="!isDeArrowIntegrationDisabled" class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.dearrow'">DeArrow</h2>
      <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
        <span v-t="'actions.uses_api_from'" /> <a class="link" href="https://sponsor.ajay.app/">sponsor.ajay.app</a>
      </p>

      <div class="grid grid-cols-1 gap-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center">
            <input
              id="chkEnableDeArrow"
              v-model="dearrow"
              type="checkbox"
              class="checkbox ml-2"
              @change="onChange"
            />
            <label class="pref font-semibold" for="chkEnableDeArrow" v-t="'actions.enable_dearrow'">فعال کردن DeArrow</label>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.dearrow_description'">
              استفاده از عنوان‌ها و تصاویر کاور برتر که توسط جامعه تهیه شده‌اند
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Settings -->
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.advanced'">پیشرفته</h2>

      <div class="grid grid-cols-1 gap-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex flex-col gap-2 w-full sm:w-64">
            <label class="pref block font-semibold" for="selectCodecs" v-t="'actions.enabled_codecs'">کدک‌های فعال</label>
            <select
              id="selectCodecs"
              v-model="enabledCodecs"
              class="select w-full"
              multiple
              @change="onChange"
            >
              <option value="vp9">VP9</option>
              <option value="avc">AVC (H.264)</option>
              <option value="av1">AV1</option>
            </select>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400" v-t="'info.enabled_codecs_description'">
              چندین گزینه را با نگه داشتن کلید Ctrl (یا Cmd در مک) و کلیک انتخاب کنید. کدک‌های فعال برای پخش ویدیو استفاده می‌شوند.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Danger Zone Reference -->
    <div class="bg-red-100 dark:bg-red-900/20 p-6 rounded-xl shadow mb-6 border border-red-300 dark:border-red-700">
      <h2 class="text-xl font-bold mb-4 text-red-700 dark:text-red-300 flex items-center">
        <i class="i-fa6-solid:triangle-exclamation ml-2"></i>
        <span v-t="'titles.danger_zone'">منطقه خطر</span>
      </h2>
      <p class="mb-4 text-red-600 dark:text-red-400" v-t="'info.danger_zone_warning'">
        برخی تنظیمات خطرناک در بخش "منطقه خطر" قابل دسترسی است. مراقب باشید!
      </p>
      <router-link to="/user/gust/danger" class="btn btn-danger w-full md:w-auto" v-t="'actions.go_to_danger_zone'">
        رفتن به منطقه خطر
      </router-link>
    </div>

    <!-- Data Management Reference -->
    <div class="bg-blue-100 dark:bg-blue-900/20 p-6 rounded-xl shadow mb-6 border border-blue-300 dark:border-blue-700">
      <h2 class="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
        <i class="i-fa6-solid:database ml-2"></i>
        <span v-t="'titles.data_management'">مدیریت داده‌ها</span>
      </h2>
      <p class="mb-4 text-blue-600 dark:text-blue-400" v-t="'info.data_management_description'">
        برای پشتیبان‌گیری و بازیابی تمام داده‌های کاربر، به بخش "پشتیبان‌گیری" بروید.
      </p>
      <router-link to="/user/gust/backup" class="btn btn-info w-full md:w-auto" v-t="'info.go_to_backup'">
        رفتن به پشتیبان‌گیری
      </router-link>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmModal
      v-if="showConfirmResetDialog"
      :message="$t('actions.confirm_reset_preferences')"
      @confirm="resetPreferences"
      @close="showConfirmResetDialog = false"
    />
  </div>
</template>

<script>
import ConfirmModal from "./ConfirmModal.vue";

export default {
  name: "UserPreferences",
  components: {
    ConfirmModal
  },
  data() {
    return {
      mobileChapterLayout: "Vertical",
      sponsorBlock: true,
      skipOptions: new Map([
        ["sponsor", { value: "auto", label: "actions.skip_sponsors" }],
        ["intro", { value: "no", label: "actions.skip_intro" }],
        ["outro", { value: "no", label: "actions.skip_outro" }],
        ["preview", { value: "no", label: "actions.skip_preview" }],
        ["interaction", { value: "auto", label: "actions.skip_interaction" }],
        ["selfpromo", { value: "auto", label: "actions.skip_self_promo" }],
        ["music_offtopic", { value: "auto", label: "actions.skip_non_music" }],
        ["poi_highlight", { value: "no", label: "actions.skip_highlight" }],
        ["filler", { value: "no", label: "actions.skip_filler_tangent" }],
      ]),
      showMarkers: true,
      minSegmentLength: 0,
      dearrow: false,
      selectedTheme: "dark",
      autoPlayVideo: true,
      autoDisplayCaptions: false,
      autoPlayNextCountdown: 5,
      listen: false,
      resolutions: [144, 240, 360, 480, 720, 1080, 1440, 2160, 4320],
      preferHls: false,
      defaultQuality: 0,
      bufferingGoal: import.meta.env.VITE_BUFFERING_GOAL || 10,
      defaultHomepage: "trending",
      minimizeComments: false,
      minimizeDescription: true,
      minimizeRecommendations: false,
      minimizeChapters: false,
      showWatchOnYouTube: false,
      searchSuggestions: true,
      watchHistory: true,
      searchHistory: false,
      hideWatched: false,
      enabledCodecs: ["vp9", "avc"], // Default to vp9 and avc initially
      disableLBRY: false,
      proxyLBRY: false,
      prefetchLimit: 2,
      password: null,
      showConfirmResetDialog: false,
      hideDislikedVideos: true, // Default to true as requested
      showAlertOnDislikedVideos: true, // Default to true for showing alerts
      proxySetting: "none", // Default to no proxy
      // New preferences from the new structure
      logUserActivity: true, // Default to true as requested
      autoplay: true,
      defaultSpeed: "1.0",
    };
  },
  computed: {
    // instances are removed as we're using a fixed custom instance
    isThemeSelectorDisabled() {
      return import.meta.env.VITE_DISABLE_THEME_SELECTOR === "true";
    },
    isWatchOnYouTubeDisabled() {
      return import.meta.env.VITE_DISABLE_WATCH_ON_YOUTUBE === "true";
    },
    isWatchHistoryStorageDisabled() {
      return import.meta.env.VITE_DISABLE_WATCH_HISTORY_STORAGE === "true";
    },
    isSearchHistoryStorageDisabled() {
      return import.meta.env.VITE_DISABLE_SEARCH_HISTORY_STORAGE === "true";
    },
    isSearchSuggestionsDisabled() {
      return import.meta.env.VITE_DISABLE_SEARCH_SUGGESTIONS === "true";
    },
    isLBRYIntegrationDisabled() {
      return import.meta.env.VITE_DISABLE_LBRY_INTEGRATION === "true";
    },
    isLBRYProxyDisabled() {
      return import.meta.env.VITE_DISABLE_LBRY_PROXY === "true";
    },
    isPrefetchLimitDisabled() {
      return import.meta.env.VITE_DISABLE_PREFETCH_LIMIT === "true";
    },
    isDeArrowIntegrationDisabled() {
      return import.meta.env.VITE_DISABLE_DEARROW_INTEGRATION === "true";
    },
    isSponsorBlockDisabled() {
      return import.meta.env.VITE_DISABLE_SPONSORBLOCK === "true";
    },
  },
  async mounted() {
    document.title = this.$t("titles.preferences") + " - " + this.getSiteName();

    if (Object.keys(this.$route.query).length > 0) this.$router.replace({ query: {} });

    // Load preferences from localStorage using the old preference system
    if (typeof(Storage) !== "undefined") {
      this.sponsorBlock = this.getPreferenceBoolean("sponsorblock", true);
      var skipOptions, skipList;
      if ((skipOptions = this.getPreferenceJSON("skipOptions")) !== undefined) {
        Object.entries(skipOptions).forEach(([key, value]) => {
          var opt = this.skipOptions.get(key);
          if (opt !== undefined) opt.value = value;
          else console.log("Unknown sponsor type: " + key);
        });
      } else if ((skipList = this.getPreferenceString("selectedSkip")) !== undefined) {
        skipList = skipList.split(",");
        this.skipOptions.forEach(opt => (opt.value = "no"));
        skipList.forEach(skip => {
          var opt = this.skipOptions.get(skip);
          if (opt !== undefined) opt.value = "auto";
          else console.log("Unknown sponsor type: " + skip);
        });
      }

      this.showMarkers = this.getPreferenceBoolean("showMarkers", true);
      this.minSegmentLength = Math.max(this.getPreferenceNumber("minSegmentLength", 0), 0);
      this.dearrow = this.getPreferenceBoolean("dearrow", false);
      this.selectedTheme = this.getPreferenceString("theme", "dark");
      this.autoPlayVideo = this.getPreferenceBoolean("playerAutoPlay", true);
      this.autoDisplayCaptions = this.getPreferenceBoolean("autoDisplayCaptions", false);
      this.autoPlayNextCountdown = this.getPreferenceNumber("autoPlayNextCountdown", 5);
      this.listen = this.getPreferenceBoolean("listen", false);
      this.defaultQuality = Number(localStorage.getItem("quality"));
      this.bufferingGoal = Math.max(
        Number(localStorage.getItem("bufferGoal")),
        import.meta.env.VITE_BUFFERING_GOAL || 10,
      );
      this.defaultHomepage = this.getPreferenceString("homepage", "trending");
      this.minimizeComments = this.getPreferenceBoolean("minimizeComments", false);
      this.minimizeDescription = this.getPreferenceBoolean("minimizeDescription", true);
      this.minimizeRecommendations = this.getPreferenceBoolean("minimizeRecommendations", false);
      this.minimizeChapters = this.getPreferenceBoolean("minimizeChapters", false);
      this.showWatchOnYouTube = this.getPreferenceBoolean("showWatchOnYouTube", false);
      this.searchSuggestions = this.getPreferenceBoolean("searchSuggestions", true);
      this.watchHistory = this.getPreferenceBoolean("watchHistory", true);
      this.searchHistory = this.getPreferenceBoolean("searchHistory", false);
      this.hideDislikedVideos = this.getPreferenceBoolean("hideDislikedVideos", true);
      this.showAlertOnDislikedVideos = this.getPreferenceBoolean("showAlertOnDislikedVideos", true);
      // Persian (fa) is the default language, no need to save in local storage
      // Get codecs from preferences or default to vp9,avc
      let codecString = this.getPreferenceString("enabledCodecs", "vp9,avc");
      this.enabledCodecs = codecString.split(",");

      // If user hasn't customized their codec settings (using defaults), check for AV1 support
      if (codecString === "vp9,avc") {
        this.checkAndEnableAV1IfSupported();
      }
      this.disableLBRY = this.getPreferenceBoolean("disableLBRY", false);
      this.proxyLBRY = this.getPreferenceBoolean("proxyLBRY", false);
      this.prefetchLimit = this.getPreferenceNumber("prefetchLimit", 2);
      this.hideWatched = this.getPreferenceBoolean("hideWatched", false);
      this.mobileChapterLayout = this.getPreferenceString("mobileChapterLayout", "Vertical");
      this.proxySetting = this.getPreferenceString("proxySetting", "none");
      // Load Persian country map
      try {
        this.CountryMap = await import(`../utils/CountryMaps/fa.json`).then(val => val.default);
      } catch (e) {
        console.error("Countries not translated into fa");
      }

      // Load additional preferences
      this.logUserActivity = this.getPreferenceBoolean("logUserActivity", true);
      this.autoplay = this.getPreferenceBoolean("autoplay", true);
      this.defaultSpeed = this.getPreferenceString("defaultSpeed", "1.0");
    }
  },
  methods: {
    async onChange() {
      if (typeof(Storage) !== "undefined") {
        var shouldReload = false;

        if (
          this.getPreferenceString("theme", "dark") !== this.selectedTheme ||
          this.getPreferenceBoolean("watchHistory", true) != this.watchHistory ||
          this.getPreferenceString("enabledCodecs", "vp9,avc") !== this.enabledCodecs.join(",")
        )
          shouldReload = true;

        localStorage.setItem("sponsorblock", this.sponsorBlock);

        var skipOptions = {};
        this.skipOptions.forEach((v, k) => (skipOptions[k] = v.value));
        localStorage.setItem("skipOptions", JSON.stringify(skipOptions));

        localStorage.setItem("showMarkers", this.showMarkers);
        localStorage.setItem("minSegmentLength", this.minSegmentLength);

        localStorage.setItem("dearrow", this.dearrow);

        localStorage.setItem("theme", this.selectedTheme);
        localStorage.setItem("playerAutoPlay", this.autoPlayVideo);
        localStorage.setItem("autoDisplayCaptions", this.autoDisplayCaptions);
        localStorage.setItem("autoPlayNextCountdown", this.autoPlayNextCountdown);
        localStorage.setItem("listen", this.listen);
        localStorage.setItem("preferHls", this.preferHls);
        localStorage.setItem("quality", this.defaultQuality);
        localStorage.setItem("bufferGoal", this.bufferingGoal);
        localStorage.setItem("homepage", this.defaultHomepage);
        localStorage.setItem("minimizeDescription", this.minimizeDescription);
        localStorage.setItem("minimizeRecommendations", this.minimizeRecommendations);
        localStorage.setItem("minimizeChapters", this.minimizeChapters);
        localStorage.setItem("showWatchOnYouTube", this.showWatchOnYouTube);
        localStorage.setItem("searchSuggestions", this.searchSuggestions);
        localStorage.setItem("watchHistory", this.watchHistory);
        localStorage.setItem("searchHistory", this.searchHistory);
        localStorage.setItem("hideDislikedVideos", this.hideDislikedVideos);
        localStorage.setItem("showAlertOnDislikedVideos", this.showAlertOnDislikedVideos);
        if (!this.searchHistory) localStorage.removeItem("search_history");
        localStorage.setItem("enabledCodecs", this.enabledCodecs.join(","));
        localStorage.setItem("disableLBRY", this.disableLBRY);
        localStorage.setItem("proxyLBRY", this.proxyLBRY);
        localStorage.setItem("prefetchLimit", this.prefetchLimit);
        localStorage.setItem("hideWatched", this.hideWatched);
        localStorage.setItem("mobileChapterLayout", this.mobileChapterLayout);
        localStorage.setItem("proxySetting", this.proxySetting);

        // Save additional preferences from new structure
        localStorage.setItem("logUserActivity", this.logUserActivity);
        localStorage.setItem("autoplay", this.autoplay);
        localStorage.setItem("defaultSpeed", this.defaultSpeed);

        if (shouldReload) window.location.reload();
      }
    },
    resetPreferences() {
      this.showConfirmResetDialog = false;
      // clear the local storage
      localStorage.clear();
      // redirect to the home page
      window.location = import.meta.env.BASE_URL;
    },
    backupPreferences() {
      const data = JSON.stringify(localStorage);
      this.download(data, "preferences.json", "application/json");
    },
    restorePreferences() {
      var file = this.$refs.fileSelector.files[0];
      file.text().then(text => {
        const data = JSON.parse(text);
        Object.keys(data).forEach(function (key) {
          localStorage.setItem(key, data[key]);
        });
        window.location.reload();
      });
    },
    getTooltipByActionLabel(label) {
      // Extract the action key from the label (removing 'actions.' prefix)
      const actionKey = label.replace("actions.", "");
      // Try to get the specific tooltip for the action
      const specificTooltip = this.$t("tooltips." + actionKey);
      // If the specific tooltip exists and is different from the key, return it
      if (specificTooltip && specificTooltip !== actionKey) {
        return specificTooltip;
      }
      // Fallback to the action label itself if no specific tooltip exists
      return this.$t(label);
    },
    async browserSupportsAV1() {
      // Check if MediaCapabilities API is available
      if (navigator.mediaCapabilities && navigator.mediaCapabilities.encodingInfo) {
        try {
          const result = await navigator.mediaCapabilities.encodingInfo({
            type: 'coded-frame',
            codec: 'av01.0.05M.08',
            width: 1920,
            height: 1080,
            bitrate: 5000000,
            framerate: 30
          });
          return result.supported;
        } catch (e) {
          console.warn("Error checking AV1 support via MediaCapabilities API:", e);
        }
      }

      // Fallback: check if MediaSource is available and assume AV1 support on modern browsers
      if (window.MediaSource) {
        const video = document.createElement('video');
        return video.canPlayType('video/webm; codecs="av01.0.05M.08"') !== '';
      }

      // Default to false if APIs are not available
      return false;
    },
    async checkAndEnableAV1IfSupported() {
      const supportsAV1 = await this.browserSupportsAV1();
      if (supportsAV1 && !this.enabledCodecs.includes('av1')) {
        // Add av1 to the beginning of the array to make it highest priority
        this.enabledCodecs = ['av1', ...this.enabledCodecs];
        // Update localStorage to persist the change
        localStorage.setItem("enabledCodecs", this.enabledCodecs.join(","));
      }
    },
    // Methods for the new preference structure
    setPreference(key, value) {
      localStorage.setItem(`pref_${key}`, value);
    },
    getPreferenceString(key, defaultValue = "") {
      const value = localStorage.getItem(`pref_${key}`);
      return value !== null ? value : defaultValue;
    },
    getPreferenceBoolean(key, defaultValue) {
      const value = localStorage.getItem(`pref_${key}`);
      if (value === null) return defaultValue;
      return value === "true";
    },
    getPreferenceNumber(key, defaultValue) {
      const value = localStorage.getItem(`pref_${key}`);
      if (value === null) return defaultValue;
      return Number(value);
    },
    getPreferenceJSON(key) {
      const value = localStorage.getItem(key);
      if (value === null) return undefined;
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error(`Error parsing JSON for key ${key}:`, e);
        return undefined;
      }
    },
    download(data, filename, type) {
      const file = new Blob([data], { type });
      const a = document.createElement("a");
      const url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    },
    applyTheme(theme) {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      this.changeTitleBarColor(theme);
      this.updateFavicon(theme);
    },
    changeTitleBarColor(theme) {
      const currentColor = { dark: "#0F0F0F", light: "#FFF" };
      const themeColor = document.querySelector("meta[name='theme-color']");
      if (themeColor) {
        themeColor.setAttribute("content", currentColor[theme]);
      }
    },
    updateFavicon(theme) {
      const favicon = document.querySelector("link[rel='icon']");
      if (favicon) {
        if (theme === "dark") {
          favicon.href = "/img/icons/dark-logo-32x32.png";
        } else {
          favicon.href = "/img/icons/light-logo-32x32.png";
        }
      }
    },
    showToast(message) {
      // Using the same toast mechanism as in other components
      const toast = document.createElement("div");
      toast.className = "toast toast-bottom toast-center";
      toast.innerHTML = `
        <div class="alert alert-info">
          <span>${message}</span>
        </div>
      `;
      document.body.appendChild(toast);

      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);
    }
  }
};
</script>
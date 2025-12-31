<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center mb-6">
      <router-link to="/user/gust" class="btn btn-secondary ml-4">
        <i class="i-fa6-solid:arrow-right"></i>
      </router-link>
      <h1 class="text-2xl font-bold">{{ $t('titles.preferences') }}</h1>
    </div>

    <!-- Two-column grid layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column -->
      <div class="space-y-6">
        <!-- Appearance Settings -->
        <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow">
          <h2 class="text-xl font-bold mb-4">{{ $t('titles.appearance') }}</h2>

          <div class="grid grid-cols-1 gap-6">


            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex flex-col gap-2 w-full sm:w-64">
                <label class="pref block font-semibold tooltip-container" for="selectHomepage">
                  <span v-t="'actions.default_homepage'">صفحه اصلی پیش‌فرض</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.default_homepage') }}</span>
                </label>
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
            </div>
          </div>
        </div>

        <!-- Player Settings -->
        <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow">
          <h2 class="text-xl font-bold mb-4" v-t="'titles.player'">پخش کننده</h2>

          <div class="grid grid-cols-1 gap-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex flex-col gap-2 w-full sm:w-64">
                <label class="pref block font-semibold tooltip-container" for="selectQuality">
                  <span v-t="'actions.default_quality'">کیفیت پیش‌فرض</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.default_quality') }}</span>
                </label>
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
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex flex-col gap-2 w-full sm:w-64">
                <label class="pref block font-semibold tooltip-container" for="selectSpeed">
                  <span v-t="'titles.default_speed'">سرعت پیش‌فرض</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('titles.default_speed') }}</span>
                </label>
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
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkAutoplay"
                    v-model="autoplay"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkAutoplay">
                  <span v-t="'actions.autoplay'">پخش خودکار</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.autoplay') }}</span>
                </label>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkAutoDisplayCaptions"
                    v-model="autoDisplayCaptions"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkAutoDisplayCaptions">
                  <span v-t="'actions.auto_display_captions'">نمایش خودکار زیرنویس</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.auto_display_captions') }}</span>
                </label>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex flex-col gap-2 w-full sm:w-64">
                <label class="pref block font-semibold tooltip-container" for="txtAutoplayNextCountdown">
                  <span v-t="'actions.autoplay_next_countdown'">زمان شمارش معکوس پخش خودکار بعدی</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.autoplay_next_countdown') }}</span>
                </label>
                <input
                  id="txtAutoplayNextCountdown"
                  v-model.number="autoPlayNextCountdown"
                  class="input w-full"
                  type="number"
                  min="0"
                  @change="onChange"
                />
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkAudioOnly"
                    v-model="listen"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkAudioOnly">
                  <span v-t="'actions.audio_only'">فقط صدا</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.audio_only') }}</span>
                </label>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkPreferHls"
                    v-model="preferHls"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkPreferHls">
                  <span v-t="'actions.prefer_hls'">اولویت HLS</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.prefer_hls') }}</span>
                </label>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex flex-col gap-2 w-full sm:w-64">
                <label class="pref block font-semibold tooltip-container" for="txtBufferingGoal">
                  <span v-t="'actions.buffering_goal'">هدف بافرگذاری</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.buffering_goal') }}</span>
                </label>
                <input
                  id="txtBufferingGoal"
                  v-model="bufferingGoal"
                  class="input w-full"
                  type="text"
                  @change="onChange"
                />
              </div>
            </div>

            <!-- Enabled Codecs Setting -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex flex-col gap-2 w-full sm:w-64">
                <label class="pref block font-semibold tooltip-container" for="selectCodecs">
                  <span v-t="'actions.enabled_codecs'">کدک‌های فعال</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.enabled_codecs') }}</span>
                </label>
                <select
                  id="selectCodecs"
                  v-model="enabledCodecs"
                  class="select w-full h-32"
                  multiple
                  @change="onChange"
                >
                  <option value="vp9">VP9</option>
                  <option value="avc">AVC (H.264)</option>
                  <option value="av1">AV1</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Video Content Settings -->
        <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow">
          <h2 class="text-xl font-bold mb-4" v-t="'titles.video_content'">محتوای ویدیو</h2>

          <div class="grid grid-cols-1 gap-6">
            <div v-if="!isCommentsDisabled" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkMinimizeComments"
                    v-model="minimizeComments"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkMinimizeComments">
                  <span v-t="'actions.minimize_comments'">کوچک کردن دیدگاه‌ها</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.minimize_comments') }}</span>
                </label>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkMinimizeDescription"
                    v-model="minimizeDescription"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkMinimizeDescription">
                  <span v-t="'actions.minimize_description'">کوچک کردن توضیحات</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.minimize_description') }}</span>
                </label>
              </div>
            </div>

            <div v-if="!isRecommendationsToggleDisabled" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkMinimizeRecommendations"
                    v-model="minimizeRecommendations"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkMinimizeRecommendations">
                  <span v-t="'actions.minimize_recommendations'">کوچک کردن پیشنهادها</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.minimize_recommendations') }}</span>
                </label>
              </div>
            </div>

            <div v-if="!isChaptersDisabled" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkMinimizeChapters"
                    v-model="minimizeChapters"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkMinimizeChapters">
                  <span v-t="'actions.minimize_chapters'">کوچک کردن فصل‌ها</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.minimize_chapters') }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-6">
        <!-- Display Settings -->
        <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow">
          <h2 class="text-xl font-bold mb-4" v-t="'titles.display'">نمایش</h2>

          <div class="grid grid-cols-1 gap-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex flex-col gap-2 w-full sm:w-64">
                <label class="pref block font-semibold tooltip-container" for="selectChapterLayoutMobile">
                  <span v-t="'actions.chapters_layout_mobile'">چیدمان فصل در موبایل</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.chapters_layout_mobile') }}</span>
                </label>
                <select
                  id="selectChapterLayoutMobile"
                  v-model="mobileChapterLayout"
                  class="select w-full"
                  @change="onChange"
                  :disabled="isChaptersDisabled"
                >
                  <option value="Horizontal" v-t="'video.chapters_horizontal'">افقی</option>
                  <option value="Vertical" v-t="'video.chapters_vertical'">عمودی</option>
                </select>
              </div>
            </div>

            <div v-if="!isWatchOnYouTubeDisabled" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkShowWatchOnYouTube"
                    v-model="showWatchOnYouTube"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkShowWatchOnYouTube">
                  <span v-t="'actions.show_watch_on_youtube'">نمایش دکمه تماشای روی یوتیوب</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.show_watch_on_youtube') }}</span>
                </label>
              </div>
            </div>

            <div v-if="!isSearchSuggestionsDisabled" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkShowSearchSuggestions"
                    v-model="searchSuggestions"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkShowSearchSuggestions">
                  <span v-t="'actions.show_search_suggestions'">نمایش پیشنهادات جستجو</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.show_search_suggestions') }}</span>
                </label>
              </div>
            </div>

            <div v-if="!isLikesDislikesDisabled" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkHideDislikedVideos"
                    v-model="hideDislikedVideos"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkHideDislikedVideos">
                  <span v-t="'actions.hide_disliked_videos'">پنهان کردن ویدیوهای ناپسندیده شده</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.hide_disliked_videos') }}</span>
                </label>
              </div>
            </div>

            <div v-if="hideDislikedVideos" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkShowAlertOnDislikedVideos"
                    v-model="showAlertOnDislikedVideos"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkShowAlertOnDislikedVideos">
                  <span v-t="'actions.show_alert_on_disliked_videos'">نمایش هشدار برای ویدیوهای ناپسندیده شده</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.show_alert_on_disliked_videos') }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Storage Settings -->
        <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow">
          <h2 class="text-xl font-bold mb-4" v-t="'titles.storage'">ذخیره‌سازی</h2>

          <div class="grid grid-cols-1 gap-6">
            <div v-if="!isWatchHistoryStorageDisabled" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkStoreWatchHistory"
                    v-model="watchHistory"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkStoreWatchHistory">
                  <span v-t="'actions.store_watch_history'">ذخیره تاریخچه تماشا</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.store_watch_history') }}</span>
                </label>
              </div>
            </div>

            <div v-if="!isSearchHistoryStorageDisabled" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkStoreSearchHistory"
                    v-model="searchHistory"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkStoreSearchHistory">
                  <span v-t="'actions.store_search_history'">ذخیره تاریخچه جستجو</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.store_search_history') }}</span>
                </label>
              </div>
            </div>

            <div v-if="watchHistory && !isWatchHistoryStorageDisabled" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkHideWatched"
                    v-model="hideWatched"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkHideWatched">
                  <span v-t="'actions.hide_watched'">پنهان کردن تماشا شده‌ها</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.hide_watched') }}</span>
                </label>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkLogUserActivity"
                    v-model="logUserActivity"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkLogUserActivity">
                  <span v-t="'actions.log_user_activity'">ثبت فعالیت‌های کاربر</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.log_user_activity') }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>


        <!-- SponsorBlock Integration -->
        <div v-if="!isSponsorBlockDisabled" class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow">
          <h2 class="text-xl font-bold mb-4" v-t="'titles.sponsorblock'">SponsorBlock</h2>
          <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
            <span v-t="'actions.uses_api_from'" /> <a class="link" href="https://sponsor.ajay.app/">sponsor.ajay.app</a>
          </p>

          <div class="grid grid-cols-1 gap-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkEnableSponsorblock"
                    v-model="sponsorBlock"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkEnableSponsorblock">
                  <span v-t="'actions.enable_sponsorblock'">فعال کردن SponsorBlock</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.enable_sponsorblock') }}</span>
                </label>
              </div>
            </div>

            <div class="mb-4">
              <h3 class="text-lg font-semibold mb-3" v-t="'titles.skip_options'">گزینه‌های پرش</h3>
              <div class="space-y-3">
                <div v-for="[name, item] in skipOptions" :key="name" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div class="flex flex-col gap-2 w-full sm:w-64">
                    <label class="pref block font-semibold tooltip-container" :for="'ddlSkip_' + name">
                      <span>{{ $t(item.label) }}</span>
                      <span class="tooltip-text">{{ getTooltipByActionLabel(item.label) }}</span>
                    </label>
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
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkShowMarkers"
                    v-model="showMarkers"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkShowMarkers">
                  <span v-t="'actions.show_markers'">نمایش نشانه‌ها</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.show_markers') }}</span>
                </label>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex flex-col gap-2 w-full sm:w-64">
                <label class="pref block font-semibold tooltip-container" for="txtMinSegmentLength">
                  <span v-t="'actions.min_segment_length'">حداقل طول قطعه</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.min_segment_length') }}</span>
                </label>
                <input
                  id="txtMinSegmentLength"
                  v-model="minSegmentLength"
                  class="input w-full"
                  type="text"
                  @change="onChange"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- DeArrow Integration -->
        <div v-if="!isDeArrowIntegrationDisabled" class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow">
          <h2 class="text-xl font-bold mb-4" v-t="'titles.dearrow'">DeArrow</h2>
          <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
            <span v-t="'actions.uses_api_from'" /> <a class="link" href="https://sponsor.ajay.app/">sponsor.ajay.app</a>
          </p>

          <div class="grid grid-cols-1 gap-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="flex items-center">
                <label class="toggle-switch ml-2">
                  <input
                    id="chkEnableDeArrow"
                    v-model="dearrow"
                    type="checkbox"
                    @change="onChange"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="pref font-semibold tooltip-container" for="chkEnableDeArrow">
                  <span v-t="'actions.enable_dearrow'">فعال کردن DeArrow</span>
                  <span class="tooltip-text">{{ getTooltipByActionLabel('actions.enable_dearrow') }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Additional sections below the two-column layout -->
    <div class="mt-6 space-y-6">
      <!-- Danger Zone & Data Management - Full Width Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Danger Zone Reference -->
        <div class="bg-red-100 dark:bg-red-900/20 p-6 rounded-xl shadow border border-red-300 dark:border-red-700">
          <h2 class="text-xl font-bold mb-4 text-red-700 dark:text-red-300 flex items-center">
            <i class="i-fa6-solid:triangle-exclamation ml-2"></i>
            <span v-t="'titles.danger_zone'">منطقه خطر</span>
          </h2>
          <p class="mb-4 text-red-600 dark:text-red-400" v-t="'info.danger_zone_warning'">
            برخی تنظیمات خطرناک در بخش "منطقه خطر" قابل دسترسی است. مراقب باشید!
          </p>
          <router-link to="/user/gust/danger" class="btn btn-danger w-full md:w-auto">
            {{ $t('actions.go_to_danger_zone') }}
          </router-link>
        </div>

        <!-- Data Management Reference -->
        <div class="bg-blue-100 dark:bg-blue-900/20 p-6 rounded-xl shadow border border-blue-300 dark:border-blue-700">
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
      </div>

      <!-- Confirmation Modal -->
      <ConfirmModal
        v-if="showConfirmResetDialog"
        :message="$t('actions.confirm_reset_preferences')"
        @confirm="resetPreferences"
        @close="showConfirmResetDialog = false"
      />
    </div>
  </div>
</template>

<style scoped>
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-text {
  visibility: hidden;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 4px;
  padding: 5px 10px;
  position: absolute;
  z-index: 1000;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s, visibility 0.3s;
  width: max-content;
  max-width: 300px;
  font-size: 0.875rem;
  white-space: normal;
}

.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
}

/* Toggle Switch Styles */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #2196F3;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

/* Two column grid for larger screens */
@media (min-width: 1024px) {
  .preferences-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
}
</style>

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
      searchHistory: true,
      hideWatched: false,
      enabledCodecs: ["vp9", "avc"], // Default to vp9 and avc initially
      disableLBRY: false,
      prefetchLimit: 2,
      password: null,
      showConfirmResetDialog: false,
      hideDislikedVideos: true, // Default to true as requested
      showAlertOnDislikedVideos: true, // Default to true for showing alerts
      // New preferences from the new structure
      logUserActivity: true, // Default to true as requested
      autoplay: true,
      defaultSpeed: "1.0",
    };
  },
  computed: {
    // instances are removed as we're using a fixed custom instance
    testLocalStorage() {
      try {
        if (window.localStorage !== undefined) localStorage;
        return true;
      } catch {
        return false;
      }
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
    isPrefetchLimitDisabled() {
      return import.meta.env.VITE_DISABLE_PREFETCH_LIMIT === "true";
    },
    isDeArrowIntegrationDisabled() {
      return import.meta.env.VITE_DISABLE_DEARROW_INTEGRATION === "true";
    },
    isSponsorBlockDisabled() {
      return import.meta.env.VITE_DISABLE_SPONSORBLOCK === "true";
    },
    isCommentsDisabled() {
      return import.meta.env.VITE_DISABLE_COMMENTS === "true";
    },
    isLikesDislikesDisabled() {
      return import.meta.env.VITE_DISABLE_LIKES_DISLIKES === "true";
    },
    isLivestreamsDisabled() {
      return import.meta.env.VITE_DISABLE_LIVESTREAMS === "true";
    },
    isDownloadThumbnailDisabled() {
      return import.meta.env.VITE_DISABLE_DOWNLOAD_THUMBNAIL === "true";
    },
    isRecommendationsToggleDisabled() {
      return import.meta.env.VITE_DISABLE_RECOMMENDATIONS_TOGGLE === "true";
    },
    isChaptersDisabled() {
      return import.meta.env.VITE_DISABLE_CHAPTERS === "true";
    },
    isVideoItemIconsDisabled() {
      return import.meta.env.VITE_DISABLE_VIDEO_ITEM_ICONS === "true";
    },
    isLicenseInfoDisabled() {
      return import.meta.env.VITE_DISABLE_LICENSE_INFO === "true";
    },
    isSearchFiltersDisabled() {
      return import.meta.env.VITE_DISABLE_SEARCH_FILTERS === "true";
    },
    isRssFeedDisabled() {
      return import.meta.env.VITE_DISABLE_RSS_FEED === "true";
    },
    isImportExportDisabled() {
      return import.meta.env.VITE_DISABLE_IMPORT_EXPORT === "true";
    },
    isAddToGroupDisabled() {
      return import.meta.env.VITE_DISABLE_ADD_TO_GROUP === "true";
    },
    isLanguageSelectorDisabled() {
      // Check if language selection is disabled via environment variable
      return import.meta.env.VITE_DISABLE_LANGUAGE_SELECTOR === "true";
    },
  },
  async mounted() {
    document.title = this.$t("titles.preferences") + " - " + this.getSiteName();

    if (Object.keys(this.$route.query).length > 0) this.$router.replace({ query: {} });

    // Load preferences from localStorage using the old preference system
    if (typeof(Storage) !== "undefined" && this.testLocalStorage) {
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
      this.autoPlayVideo = this.getPreferenceBoolean("playerAutoPlay", true);
      this.autoDisplayCaptions = this.getPreferenceBoolean("autoDisplayCaptions", false);
      this.autoPlayNextCountdown = this.getPreferenceNumber("autoPlayNextCountdown", 5);
      this.listen = this.getPreferenceBoolean("listen", false);
      this.defaultQuality = this.getPreferenceNumber("quality", 0);
      this.bufferingGoal = Math.max(
        this.getPreferenceNumber("bufferGoal", import.meta.env.VITE_BUFFERING_GOAL || 10),
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
      this.searchHistory = this.getPreferenceBoolean("searchHistory", true);
      this.hideDislikedVideos = this.getPreferenceBoolean("hideDislikedVideos", true);
      this.showAlertOnDislikedVideos = this.getPreferenceBoolean("showAlertOnDislikedVideos", true);
      // Persian (fa) is the default language, no need to save in local storage
      // Get codecs from preferences or default to vp9,avc
      let codecString = this.getPreferenceString("enabledCodecs", "vp9,avc");
      this.enabledCodecs = codecString.split(",");

      // Always check for AV1 support regardless of current codec settings
      // This ensures AV1 is enabled when supported by the browser
      this.checkAndEnableAV1IfSupported();
      this.disableLBRY = this.getPreferenceBoolean("disableLBRY", false);
      this.prefetchLimit = this.getPreferenceNumber("prefetchLimit", 2);
      this.hideWatched = this.getPreferenceBoolean("hideWatched", false);
      this.mobileChapterLayout = this.getPreferenceString("mobileChapterLayout", "Vertical");

      // Load additional preferences
      this.logUserActivity = this.getPreferenceBoolean("logUserActivity", true);
      this.autoplay = this.getPreferenceBoolean("autoplay", true);
      this.defaultSpeed = this.getPreferenceString("defaultSpeed", "1.0");

    }
  },
  methods: {
    async onChange() {
      if (typeof(Storage) !== "undefined" && this.testLocalStorage) {
        var shouldReload = false;

        if (
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
        if (!this.searchHistory) {
            localStorage.removeItem("search_history");
        }
        localStorage.setItem("enabledCodecs", this.enabledCodecs.join(","));
        localStorage.setItem("disableLBRY", this.disableLBRY);
        localStorage.setItem("prefetchLimit", this.prefetchLimit);
        localStorage.setItem("hideWatched", this.hideWatched);
        localStorage.setItem("mobileChapterLayout", this.mobileChapterLayout);

        // Save additional preferences from new structure
        localStorage.setItem("logUserActivity", this.logUserActivity);
        localStorage.setItem("autoplay", this.autoplay);
        localStorage.setItem("defaultSpeed", this.defaultSpeed);

        if (shouldReload) window.location.reload();
      }
    },
    resetPreferences() {
      if (!this.testLocalStorage) {
        alert(this.$t("info.local_storage"));
        return;
      }

      this.showConfirmResetDialog = false;
      // clear the local storage
      localStorage.clear();
      // redirect to the home page
      window.location = import.meta.env.BASE_URL;
    },
    backupPreferences() {
      if (!this.testLocalStorage) {
        alert(this.$t("info.local_storage"));
        return;
      }

      const data = JSON.stringify(localStorage);
      this.download(data, "preferences.json", "application/json");
    },
    restorePreferences() {
      if (!this.testLocalStorage) {
        alert(this.$t("info.local_storage"));
        return;
      }

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
          // For encoding capabilities, use 'record' or 'transmission' type - 'file' is not valid
          const result = await navigator.mediaCapabilities.encodingInfo({
            type: 'record', // Use 'record' for encodingInfo
            video: {
              contentType: 'video/webm; codecs="av01.0.05M.08"',
              width: 1920,
              height: 1080,
              bitrate: 5000000,
              framerate: 30
            }
          });
          return result.supported;
        } catch (e) {
          console.warn("Error checking AV1 support via MediaCapabilities API:", e);
        }
      }

      // Alternative approach: try to detect AV1 support using canPlayType
      const video = document.createElement('video');
      const canPlayAV1WebM = video.canPlayType('video/webm; codecs="av01.0.05M.08"') !== '';
      const canPlayAV1Mp4 = video.canPlayType('video/mp4; codecs="av01.0.05M.08"') !== '';
      return canPlayAV1WebM || canPlayAV1Mp4;
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
    // Methods for the new preference structure - consistent with main.js
    setPreference(key, value, disableAlert = false) {
      if (!this.testLocalStorage) return;

      try {
        localStorage.setItem(key, value);
      } catch {
        if (!disableAlert) alert(this.$t("info.local_storage"));
      }
    },
    getPreferenceString(key, defaultVal) {
      var value;
      if (
        (value = new URLSearchParams(window.location.search).get(key)) !== null ||
        (this.testLocalStorage && (value = localStorage.getItem(key)) !== null)
      ) {
        return value;
      } else return defaultVal;
    },
    getPreferenceBoolean(key, defaultVal) {
      var value;
      if (
        (value = new URLSearchParams(window.location.search).get(key)) !== null ||
        (this.testLocalStorage && (value = localStorage.getItem(key)) !== null)
      ) {
        switch (String(value).toLowerCase()) {
          case "true":
          case "1":
          case "on":
          case "yes":
            return true;
          default:
            return false;
        }
      } else return defaultVal;
    },
    getPreferenceNumber(key, defaultVal) {
      var value;
      if (
        (value = new URLSearchParams(window.location.search).get(key)) !== null ||
        (this.testLocalStorage && (value = localStorage.getItem(key)) !== null)
      ) {
        const num = Number(value);
        return isNaN(num) ? defaultVal : num;
      } else return defaultVal;
    },
    getPreferenceJSON(key, defaultVal) {
      var value;
      if (
        (value = new URLSearchParams(window.location.search).get(key)) !== null ||
        (this.testLocalStorage && (value = localStorage.getItem(key)) !== null)
      ) {
        try {
          return JSON.parse(value);
        } catch (e) {
          console.error(`Error parsing JSON for key ${key}:`, e);
          return defaultVal;
        }
      } else return defaultVal;
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
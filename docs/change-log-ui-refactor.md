# Change Log – UI Refactor & TikTok-first Dashboard

## 1) Tổng quan

File này log lại các phần code đã thay đổi trong đợt refactor UI gần nhất, tập trung vào:

- Chuyển layout dashboard theo hướng **right-tabbar + shop panel cố định**
- Thiết kế lại vùng overview theo kiểu module nhỏ, dễ mở rộng
- Ưu tiên mặc định nền tảng **TikTok**

> Ghi chú: đây là log kỹ thuật các file đã sửa/thêm. Các phần nghiệp vụ TikTok Live Studio mức 1 vẫn là hạng mục tiếp theo.

---

## 2) File đã sửa (Modified)

### `src/app/app.tsx`

- Đổi bố cục chính sang 3 cột:
  - Main content
  - `ShopInfoPanel` (sticky)
  - `RightTabbar`
- Bổ sung `TopStatusBar` để hiển thị trạng thái realtime ở đầu trang.
- Đổi platform mặc định từ `Shopee` -> `Tiktok`.
- Truyền thêm dữ liệu comment vào `buildStudioRouteProps`.

### `src/app/util/build-route-props.util.ts`

- Mở rộng `BuildStudioRoutePropsArgs` để nhận thêm `comment` slice.
- Truyền `comments` vào `studioProps` phục vụ layout overview mới (comment stream panel).

### `src/common/constant/management-platform.constant.ts`

- Đổi thứ tự platform option từ `["Shopee", "Tiktok"]` -> `["Tiktok", "Shopee"]`.

### `src/components/OverviewTab.tsx`

- Refactor từ file lớn sang orchestration component.
- Dùng các module con:
  - `OverviewSessionTabs`
  - `OverviewControlPanel`
  - `OverviewObsPanel`
  - `OverviewLogsPanel`
  - `OverviewGrid`

---

## 3) File đã thêm (Added)

### Nhóm layout

#### `src/components/layout/RightTabbar.tsx`

- Tabbar dọc bên phải (Live/Products/Comments/Reports)
- Nút đổi theme + logout
- Active state nổi bật theo theme TikTok-first

#### `src/components/layout/ShopInfoPanel.tsx`

- Panel cố định hiển thị:
  - Platform selector
  - Shop snapshot
  - Operator/account info

#### `src/components/layout/TopStatusBar.tsx`

- Thanh trạng thái realtime (session state, viewers, connection)
- Hiển thị app error ở top bar

### Nhóm overview

#### `src/components/overview/overview-tab.type.ts`

- Chuẩn hóa type props cho `OverviewTab` và các sub-components.
- Bổ sung `comments` trong props để render comment stream.

#### `src/components/overview/OverviewSessionTabs.tsx`

- Cụm tab phụ cho overview:
  - Session
  - OBS
  - Logs
- Có active state rõ ràng.

#### `src/components/overview/OverviewControlPanel.tsx`

- Nhóm điều khiển session:
  - Upload cover
  - Lịch start/end
  - Create/Generate/Start/End actions
  - Stream URL + state + quick metrics

#### `src/components/overview/OverviewObsPanel.tsx`

- Giao diện thao tác OBS tách riêng:
  - Connect/disconnect
  - Scene switch
  - Start/end live
  - Trạng thái OBS hiện tại

#### `src/components/overview/OverviewLogsPanel.tsx`

- Panel hiển thị log thao tác gần nhất (cuộn được).

#### `src/components/overview/OverviewGrid.tsx`

- Main grid 3 cột:
  - Product list (trái)
  - Video preview (giữa)
  - Comment stream (phải)

---

## 4) Trạng thái build

- Đã chạy `npm run build` thành công ở lần kiểm tra gần nhất.

---

## 5) Hạng mục đã hoàn thành bổ sung

1. **Branding update**
   - Đổi brand text sang **Ecentric AI Studio** ở các vị trí chính.
   - Cập nhật app title (`index.html`) và package name (`package.json`).
   - Cập nhật mock profile/shop naming theo branding mới.

2. **Login UI refresh**
   - Áp dụng layout login mới theo yêu cầu: **2-color gradient background + dark login box**.
   - Cập nhật heading/subheading login theo copy mới.

3. **Tách flow Shopee OBS vs TikTok Live Studio (mức 1)**
   - Shopee giữ flow OBS control như cũ.
   - TikTok có flow riêng: attach/detach playable live URL, trạng thái `disconnected|attached|live`.
   - Bắt buộc attach TikTok playable URL trước khi Start Live trên TikTok.

4. **Preview video từ TikTok playable URL**
   - Khi đang ở platform TikTok và đã attach URL, preview panel phát `<video>` trực tiếp từ URL đó.
   - Hiển thị badge trạng thái live studio trên preview.

5. **Build verification**
   - Đã chạy lại `npm run build` thành công sau toàn bộ thay đổi.

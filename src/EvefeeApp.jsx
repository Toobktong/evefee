import React, { useState, useEffect, useMemo, useCallback } from "react";

/* ============================================================
   EVEFEE — Web Ordering Prototype
   Customer ordering + Store admin, single artifact, mock backend
   via window.storage (shared across everyone who opens this link).
   ============================================================ */

/* ---------------- Design tokens (injected once) ---------------- */
function GlobalStyle() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  return (
    <style>{`
      :root{
        --cream:#F6F1E6;
        --cream-soft:#FBF8F1;
        --forest:#1F3A2E;
        --forest-deep:#132920;
        --sage:#7C9A82;
        --terracotta:#C17A4F;
        --terracotta-deep:#A8623A;
        --cocoa:#4A2E23;
        --gold:#D4A24C;
        --line:#E2D9C6;
        --danger:#B5493A;
      }
      .evefee-root{
        font-family:'Inter',sans-serif;
        background:var(--cream);
        color:var(--cocoa);
        min-height:600px;
        border-radius:16px;
        overflow:hidden;
        position:relative;
      }
      .evefee-root *{box-sizing:border-box;}
      .ev-display{font-family:'Fraunces',serif;}
      .ev-eyebrow{
        font-size:11px; letter-spacing:0.18em; text-transform:uppercase;
        font-weight:700; color:var(--forest);
      }
      .ev-scroll{max-height:640px; overflow-y:auto;}
      .ev-scroll::-webkit-scrollbar{width:6px;}
      .ev-scroll::-webkit-scrollbar-thumb{background:var(--line); border-radius:4px;}
      .ev-btn{
        font-family:'Inter',sans-serif; font-weight:700; font-size:14px;
        border:none; border-radius:999px; padding:11px 22px; cursor:pointer;
        transition:transform .12s ease, opacity .12s ease;
      }
      .ev-btn:active{transform:scale(0.97);}
      .ev-btn-primary{background:var(--forest); color:var(--cream-soft);}
      .ev-btn-primary:hover{opacity:0.9;}
      .ev-btn-primary:disabled{opacity:0.4; cursor:not-allowed;}
      .ev-btn-outline{background:transparent; color:var(--forest); border:1.5px solid var(--forest);}
      .ev-btn-outline:hover{background:rgba(31,58,46,0.06);}
      .ev-btn-terracotta{background:var(--terracotta); color:#fff;}
      .ev-btn-terracotta:hover{background:var(--terracotta-deep);}
      .ev-btn-ghost{background:transparent; color:var(--cocoa); padding:8px 10px;}
      .ev-chip{
        display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:700;
        padding:5px 12px; border-radius:999px; background:rgba(31,58,46,0.08); color:var(--forest);
      }
      .ev-card{
        background:var(--cream-soft); border:1px solid var(--line); border-radius:14px;
      }
      .ev-input{
        width:100%; border:1.5px solid var(--line); border-radius:10px; padding:10px 12px;
        font-size:14px; font-family:'Inter',sans-serif; background:#fff; color:var(--cocoa);
      }
      .ev-input:focus{outline:none; border-color:var(--forest);}
      .ev-label{font-size:12px; font-weight:700; color:var(--cocoa); opacity:0.7; margin-bottom:6px; display:block;}
      .ev-section-title{
        display:flex; align-items:center; gap:10px; margin:0 0 14px 0;
      }
      .ev-section-title h2{margin:0; font-size:20px; font-weight:600;}
      .ev-section-title .rule{flex:1; height:1px; background:var(--line);}
      .ev-tabbar{
        display:flex; gap:4px; background:rgba(31,58,46,0.06); padding:4px; border-radius:12px;
      }
      .ev-tabbar button{
        flex:1; border:none; background:transparent; padding:9px 8px; border-radius:9px;
        font-weight:700; font-size:12.5px; cursor:pointer; color:var(--cocoa); opacity:0.65;
      }
      .ev-tabbar button.active{background:#fff; opacity:1; color:var(--forest); box-shadow:0 1px 3px rgba(0,0,0,0.08);}
      .ev-status-badge{
        font-size:11px; font-weight:700; padding:4px 10px; border-radius:999px; white-space:nowrap;
      }
      .ev-modal-backdrop{
        position:absolute; inset:0; background:rgba(19,41,32,0.55); z-index:50;
        display:flex; align-items:flex-end; justify-content:center;
      }
      @media(min-width:640px){ .ev-modal-backdrop{ align-items:center; } }
      .ev-modal{
        background:var(--cream-soft); width:100%; max-width:480px; border-radius:20px 20px 0 0;
        max-height:88%; overflow-y:auto; padding:22px;
      }
      @media(min-width:640px){ .ev-modal{ border-radius:20px; } }
      .ev-fab-toggle{
        position:absolute; top:14px; right:14px; z-index:40; display:flex; gap:6px;
        background:rgba(255,255,255,0.9); border:1px solid var(--line); border-radius:999px; padding:4px;
      }
      .ev-fab-toggle button{
        border:none; background:transparent; font-size:11px; font-weight:700; padding:6px 12px;
        border-radius:999px; cursor:pointer; color:var(--cocoa); opacity:0.6;
      }
      .ev-fab-toggle button.active{background:var(--forest); color:#fff; opacity:1;}
      .qty-btn{
        width:30px; height:30px; border-radius:999px; border:1.5px solid var(--forest); background:#fff;
        color:var(--forest); font-weight:800; cursor:pointer; font-size:16px; line-height:1;
      }
      .ev-swatch{
        width:28px; height:28px; border-radius:999px; border:2px solid transparent; cursor:pointer;
      }
      .ev-nav-side{
        width:180px; background:var(--forest-deep); color:var(--cream-soft); padding:18px 14px;
      }
      .ev-nav-side button{
        display:block; width:100%; text-align:left; background:transparent; border:none;
        color:rgba(246,241,230,0.75); font-weight:600; font-size:13px; padding:10px 12px;
        border-radius:9px; cursor:pointer; margin-bottom:2px;
      }
      .ev-nav-side button.active{background:rgba(255,255,255,0.12); color:#fff;}
      table.ev-table{width:100%; border-collapse:collapse; font-size:13px;}
      table.ev-table th{
        text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.05em;
        color:var(--cocoa); opacity:0.55; padding:8px 10px; border-bottom:1.5px solid var(--line);
      }
      table.ev-table td{padding:10px; border-bottom:1px solid var(--line); vertical-align:middle;}
      .cup-progress-step{display:flex; flex-direction:column; align-items:center; gap:6px; flex:1;}
      .cup-progress-line{flex:1; height:2px; background:var(--line); margin-top:15px;}
      .cup-progress-line.done{background:var(--forest);}
      .ev-marquee-track{
        display:flex; gap:12px; width:max-content;
        animation: ev-marquee-scroll linear infinite;
      }
      .ev-marquee-track.paused{ animation-play-state: paused; }
      @keyframes ev-marquee-scroll{
        from{ transform: translateX(0); }
        to{ transform: translateX(-50%); }
      }
      .ev-logo-tap{
        display:inline-block; touch-action:manipulation; -webkit-tap-highlight-color:transparent;
      }
      .ev-logo-tap.pulse{ animation: ev-logo-pulse 0.18s ease; }
      @keyframes ev-logo-pulse{
        0%{ transform: scale(1); }
        50%{ transform: scale(1.06); }
        100%{ transform: scale(1); }
      }
    `}</style>
  );
}

/* ---------------- i18n ---------------- */
const T = {
  th: {
    brand: "EVEFEE", tagline: "Good day starts with EVEFEE",
    nav_home: "หน้าแรก", nav_menu: "เมนู", nav_cart: "ตะกร้า", nav_history: "ประวัติ", nav_track: "ติดตามออเดอร์",
    admin_login_title: "เข้าสู่ระบบร้านค้า", email: "อีเมล", password: "รหัสผ่าน", login: "เข้าสู่ระบบ",
    login_error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    bestseller: "เมนูแนะนำ", categories: "หมวดหมู่", search_ph: "ค้นหาเมนู...",
    add_to_cart: "เพิ่มลงตะกร้า", baht: "บาท", temp: "เลือกอุณหภูมิ", sweet: "ระดับความหวาน", ice: "ระด��[...]",
    addons: "เพิ่มเติม", note: "หมายเหตุ", note_ph: "เช่น หวานน้อย ไม่ใส่วิป", qty: "จำนวน",
    hot: "ร้อน", iced: "เย็น", frappe: "ปั่น", ice_normal: "ปกติ", ice_less: "น้อย", ice_none: "ไม่ใส่",
    cart_title: "ตะกร้าของฉัน", cart_empty: "ยังไม่มีสินค้าในตะกร้า", go_menu: "ไปเลือกเมนู",
    total: "รวมทั้งหมด", checkout: "ดำเนินการสั่งซื้อ", coupon_ph: "ใส่โค้ดคูปอง", apply: "ใช้โค้ด",
    coupon_invalid: "ไม่พบคูปองนี้", coupon_applied: "ใช้คูปองแล้ว", discount: "ส่วนลด",
    checkout_title: "ยืนยันคำสั่งซื้อ", fulfil: "รับสินค้าแบบไหน", pickup: "รับที่ร้าน", delivery: "จัดส�[...]",
    delivery_provider: "ผู้ให้บริการจัดส่ง", when: "เวลา", now_order: "สั่งทันที", schedule: "จองล่วงหน้า",
    payment: "วิธีชำระเงิน", qr: "QR PromptPay", transfer: "โอนเงิน", card: "บัตรเครดิต", cash: "เงินสด",
    name: "ชื่อผู้สั่ง", phone: "เบอร์โทร (ใช้ค้นหาประวัติ)", address: "ที่อยู่จัดส่ง", place_order: [...]
  },
  en: {
    brand: "EVEFEE", tagline: "Good day starts with EVEFEE",
    nav_home: "Home", nav_menu: "Menu", nav_cart: "Cart", nav_history: "History", nav_track: "Track Order",
    admin_login_title: "Store Sign In", email: "Email", password: "Password", login: "Sign In",
    login_error: "Incorrect email or password",
    bestseller: "Recommended", categories: "Categories", search_ph: "Search menu...",
    add_to_cart: "Add to Cart", baht: "THB", temp: "Choose Temperature", sweet: "Sweetness", ice: "Ice Level",
    addons: "Add-ons", note: "Note", note_ph: "e.g. less sweet, no whip", qty: "Quantity",
    hot: "Hot", iced: "Ice", frappe: "Frappe", ice_normal: "Normal", ice_less: "Less", ice_none: "No Ice",
    cart_title: "My Cart", cart_empty: "Your cart is empty", go_menu: "Browse Menu",
    total: "Total", checkout: "Checkout", coupon_ph: "Enter coupon code", apply: "Apply",
    coupon_invalid: "Coupon not found", coupon_applied: "Coupon applied", discount: "Discount",
    checkout_title: "Confirm Order", fulfil: "Fulfillment", pickup: "Pickup", delivery: "Delivery",
    delivery_provider: "Delivery Partner", when: "Timing", now_order: "Order Now", schedule: "Schedule",
    payment: "Payment Method", qr: "QR PromptPay", transfer: "Bank Transfer", card: "Credit Card", cash: "Cash",
    name: "Your Name", phone: "Phone (for order history)", address: "Delivery Address", place_order: "Place Order",
    order_placed: "Order Placed!", order_no: "Order No.", track_this: "Track This Order",
    status_received: "Received", status_preparing: "Preparing", status_ready: "Ready",
    status_delivering: "Delivering", status_completed: "Completed", status_cancelled: "Cancelled",
    track_title: "Track Order Status", enter_order_id: "Enter order number", track_btn: "Search",
    not_found: "Order not found", history_title: "Order History", enter_phone: "Enter phone number",
    find: "Search", order_again: "Order Again", items: "items", no_history: "No order history found",
    customer_view: "Customer", admin_view: "Store", logout: "Logout",
    dash_today_sales: "Today's Sales", dash_today_orders: "Today's Orders", dash_top_item: "Top Item",
    dash_new_cust: "Customers Today", nav_dashboard: "Dashboard", nav_orders: "Orders", nav_kitchen: "Kitchen",
    nav_menu_mgmt: "Menu", nav_promo: "Promotions", nav_banner: "Banners", nav_reports: "Reports", nav_reset: "Reset Sample Data",
    marquee_hint: "Tap to pause / resume",
    banner_section_title: "News & Promotions", add_banner: "+ Add Banner", edit_banner: "Edit Banner",
    banner_image_label: "Banner Image", banner_title_label: "Title", banner_desc_label: "Description (optional)",
    banner_active: "Show on home page", no_banners: "No banners yet. Tap \"Add Banner\" to create one.",
    banner_upload_required: "Please upload an image before saving", banner_text_ph: "e.g. Buy 1 Get 1 Free today only!",
    order_mgmt_title: "All Orders", col_order: "Order", col_time: "Time", col_customer: "Customer",
    col_items: "Items", col_total: "Total", col_status: "Status", col_action: "Action",
    kitchen_title: "Kitchen — Barista", start: "Start", done: "Done", no_active: "No active orders right now",
    menu_mgmt_title: "Menu Management", add_item: "+ Add Item", edit: "Edit", delete: "Delete", available: "Available",
    unavailable: "Unavailable", item_name_th: "Name (Thai)", item_name_en: "Name (English)", item_price: "Price",
    item_cat: "Category", save: "Save", cancel: "Cancel", confirm_delete: "Delete this item?",
    promo_title: "Promotions & Coupons", add_promo: "+ Create Promotion", promo_name: "Promotion Name",
    promo_code: "Coupon Code", promo_type: "Discount Type", percent: "Percent off", fixed: "Fixed amount off",
    promo_value: "Discount Value", reports_title: "Reports", reports_sales: "Total Sales", reports_orders: "Total Orders",
    reports_avg: "Avg. Order Value", reports_top: "Top 5 Items", reports_by_cat: "Sales by Category",
    loading: "Loading...", recommended: "Recommended", cat_coffee: "Coffee", cat_matcha: "Matcha", cat_tea: "Tea",
    cat_special: "Special", search_no_result: "No menu items found", welcome_admin: "Hello, Store Manager",
    reset_confirm: "Reset menu/promotions back to defaults? (Orders will be kept)",
    all_cat: "All",
    nav_member: "Member", member_title: "EVEFEE Membership", member_lookup_ph: "Enter phone number to view your points",
    member_not_found: "No membership found yet. Place your first order to start earning points.",
    member_login_title: "Member Login", member_register_title: "Create Account",
    full_name_label: "Full Name", phone_label: "Phone Number", confirm_password: "Confirm Password",
    switch_to_register: "Don't have an account? Register", switch_to_login: "Already have an account? Log in",
    member_login_error: "Incorrect phone number or password", member_login_no_account: "No account found. Please register first.",
    account_exists: "This phone number already has an account. Please log in.", password_mismatch: "Passwords do not match",
    password_too_short: "Password must be at least 6 characters", logged_in_as: "Logged in as",
    member_points: "Points Balance", member_spent: "Total Spent", member_joined: "Member Since",
    tier_bronze: "Bronze", tier_silver: "Silver", tier_gold: "Gold",
    earn_info: "Earn 1 point per ฿10 spent • 1 point = ฿0.5 discount",
    to_next_tier: "to reach", redeem_points_label: "Redeem points for discount", redeem_points_ph: "Points to redeem",
    redeem_available: "Points available", points_discount: "Points Discount",
    points_invalid_code: "Invalid points code (must be a multiple of the redemption unit)", points_insufficient: "Not enough points for this code",
    qr_settings_title: "QR PromptPay Settings", qr_upload_label: "Upload QR PromptPay Image",
    qr_current: "Current QR", qr_remove: "Remove QR", qr_none_admin: "No QR image uploaded yet",
    qr_missing_customer: "The store hasn't uploaded a QR PromptPay yet. Please choose another payment method.",
    qr_pay_via: "Pay via bank", qr_save_image: "Save QR Image", qr_open_bank_app: "Open Bank App",
    qr_open_app_hint: "If the app isn't installed, you'll be taken to the download page instead.",
    nav_settings: "Settings", nav_members: "Members",
    members_title: "Member Management", col_name: "Name", col_phone: "Phone", col_tier: "Tier",
    col_points: "Points", col_spent: "Spent", col_orders: "Orders", no_members: "No member data yet",
    settings_title: "Payment & Fulfillment Settings",
    payment_methods: "Enabled Payment Methods", enable: "Enabled",
    bank_info: "Bank Transfer Details", bank_name: "Bank Name", account_no: "Account No.", account_name: "Account Name",
    fulfillment_settings: "Fulfillment Options", enable_pickup: "Enable Pickup", enable_delivery: "Enable Delivery",
    delivery_fee: "Delivery Fee (THB)", delivery_providers: "Delivery Providers", add_provider: "+ Add Provider",
    loyalty_settings: "Loyalty Points", loyalty_enabled: "Enable loyalty points",
    loyalty_earn_rate: "Earn Rate", loyalty_earn_rate_suffix: "= 1 point",
    loyalty_redeem_rate: "Redeem Rate", loyalty_points_word: "points",
    provider_name_th: "Name (Thai)", provider_name_en: "Name (English)", remove: "Remove",
    temp_options: "Available Temperature Options", sweet_adjustable: "ปรับระดับความหวานได้", ice_adjustable: "ปรั��[...]",
    available_addons: "ตัวเลือกเพิ่มเติมที่มี",
    member_required_title: "ยืนยันสมาชิกก่อนสั่งซื้อ", member_required_desc: "ลูกค้าต้องเป็นสมาชิกก่อ[...]
  },
};

/* ---------------- Menu data (seeded from EVEFEE poster) ---------------- */
const CATS = ["coffee", "matcha", "tea", "special"];
const CAT_COLORS = {
  coffee: ["#8a5a34", "#3c2415"],
  matcha: ["#8bc06b", "#4c7a34"],
  tea: ["#e08a3c", "#c1461f"],
  special: ["#e8a3b0", "#b5493a"],
};
const ALL_ADDON_IDS = ["shot", "honey", "jelly"];
const DEFAULT_MENU = [
  { id: "c1", cat: "coffee", nameTh: "อเมริกาโน่มะพร้าว", nameEn: "Coconut Americano", price: 40, colors: ["#c9a876", "#2b1810"], temps: ["hot", "iced"], sweetAd[...] },
  // (truncated for brevity in this file copy) — original file had full menu
];
const ADDONS = [
  { id: "shot", th: "เอ็กซ์ตร้าช็อต", en: "Extra Shot", price: 15 },
  { id: "honey", th: "น้ำผึ้ง", en: "Honey", price: 10 },
  { id: "jelly", th: "วุ้นมะพร้าว", en: "Coconut Jelly", price: 10 },
];
const DEFAULT_PROMOTIONS = [
  { id: "p1", code: "EVEFEE10", name_th: "ลด 10%", name_en: "10% Off", type: "percent", value: 10 },
  { id: "p2", code: "SAVE20", name_th: "ลด 20 บาท", name_en: "฿20 Off", type: "fixed", value: 20 },
];
const DEFAULT_BANNERS = []; // store news/promo slides — admin adds these via the Banner tab
const DEFAULT_SETTINGS = {
  payments: { qr: true, transfer: true, card: true, cash: true },
  bank: { bankName: "", accountNo: "", accountName: "" },
  fulfillment: { pickup: true, delivery: true, deliveryFee: 0 },
  deliveryProviders: [
    { id: "grab", th: "Grab", en: "Grab" },
    { id: "lalamove", th: "Lalamove", en: "Lalamove" },
  ],
  loyalty: { enabled: true, earnPerBaht: 20, redeemPoints: 100, redeemValue: 50 },
};
const ADMIN_EMAIL = "manager@evefee.com";
const ADMIN_PASS = "adminmanager";
const STATUS_FLOW = ["received", "preparing", "ready", "completed"];
const STATUS_COLORS = {
  received: "#D4A24C", preparing: "#C17A4F", ready: "#7C9A82",
  delivering: "#7C9A82", completed: "#1F3A2E", cancelled: "#B5493A",
};

/* ---------------- Membership / loyalty points ---------------- */
const DEFAULT_EARN_PER_BAHT = 20; // spend this many baht to earn 1 point
const DEFAULT_POINT_REDEEM_UNIT = 100; // points needed per redemption unit
const DEFAULT_POINT_REDEEM_VALUE = 50; // baht discount per redemption unit
function getLoyaltyConfig(settings) {
  const l = (settings && settings.loyalty) || {};
  return {
    enabled: l.enabled !== false,
    earnPerBaht: Number(l.earnPerBaht) || DEFAULT_EARN_PER_BAHT,
    redeemPoints: Number(l.redeemPoints) || DEFAULT_POINT_REDEEM_UNIT,
    redeemValue: Number(l.redeemValue) || DEFAULT_POINT_REDEEM_VALUE,
  };
}
const TIERS = [
  { key: "bronze", min: 0 },
  { key: "silver", min: 2000 },
  { key: "gold", min: 8000 },
];
const TIER_COLORS = { bronze: "#A8623A", silver: "#8A97A0", gold: "#D4A24C" };
function tierOf(spent) {
  let cur = TIERS[0];
  for (const tr of TIERS) if (spent >= tr.min) cur = tr;
  return cur.key;
}
function nextTierInfo(spent) {
  const idx = TIERS.findIndex((tr) => tr.key === tierOf(spent));
  if (idx === TIERS.length - 1) return null;
  const next = TIERS[idx + 1];
  return { tier: next.key, remaining: Math.max(0, next.min - spent) };
}
function TierBadge({ tier, t }) {
  const c = TIER_COLORS[tier] || "#999";
  return <span className="ev-status-badge" style={{ background: `${c}22`, color: c }}>{t[`tier_${tier}`]}</span>;
}

/* ---------------- Thai bank app deep links ---------------- */
const BANK_APPS = [
  { match: ["kbank", "kasikorn", "กสิกร", "k plus", "kplus"], name: "K PLUS", scheme: "kplus://",
    ios: "https://apps.apple.com/th/app/k-plus/id356798160", android: "https://play.google.com/store/apps/details?id=com.kasikorn.retail.mbanking.wap" },
  { match: ["scb", "ไทยพาณิชย์", "siam commercial"], name: "SCB EASY", scheme: "scbeasy://",
    ios: "https://apps.apple.com/th/app/scb-easy/id449133718", android: "https://play.google.com/store/apps/details?id=com.scb.phone" },
  { match: ["bangkok bank", "bbl", "กรุงเทพ", "บัวหลวง", "bualuang"], name: "Bualuang mBanking", scheme: "bualuang://",
    ios: "https://apps.apple.com/th/app/bualuang-mbanking/id449528705", android: "https://play.google.com/store/apps/details?id=com.bbl.mobilebanking" },
  { match: ["krungthai", "ktb", "กรุงไทย", "next"], name: "Krungthai NEXT", scheme: "ktbnext://",
    ios: "https://apps.apple.com/th/app/krungthai-next/id1244265636", android: "https://play.google.com/store/apps/details?id=com.ktb.next" },
  { match: ["krungsri", "กรุงศรี", "ayudhya", "kma"], name: "Krungsri App", scheme: "krungsriapp://",
    ios: "https://apps.apple.com/th/app/krungsri-app/id1119059307", android: "https://play.google.com/store/apps/details?id=com.krungsri.kma" },
  { match: ["ttb", "ทีเอ็มบีธนชาต", "ทหารไทย", "thanachart"], name: "ttb touch", scheme: "ttbtouch://",
    ios: "https://apps.apple.com/th/app/ttb-touch/id1479535986", android: "https://play.google.com/store/apps/details?id=com.ttbbank.touch" },
  { match: ["gsb", "ออมสิน", "mymo"], name: "MyMo", scheme: "mymo://",
    ios: "https://apps.apple.com/th/app/mymo-by-gsb/id1112500337", android: "https://play.google.com/store/apps/details?id=th.co.gsb.mymo" },
  { match: ["uob", "ยูโอบี", "tmrw"], name: "UOB TMRW", scheme: "uobtmrw://",
    ios: "https://apps.apple.com/th/app/uob-tmrw/id1459730939", android: "https://play.google.com/store/apps/details?id=com.uob.mighty.th" },
];
function getBankApp(bankName) {
  const key = (bankName || "").trim().toLowerCase();
  if (!key) return null;
  return BANK_APPS.find((b) => b.match.some((m) => key.includes(m))) || null;
}
function isIOS() {
  return typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent || "");
}
function openBankApp(bankName) {
  const app = getBankApp(bankName);
  if (!app) return false;
  const fallbackUrl = isIOS() ? app.ios : app.android;
  let handedOff = false;
  const onBlur = () => { handedOff = true; };
  window.addEventListener("blur", onBlur);
  window.location.href = app.scheme;
  setTimeout(() => {
    window.removeEventListener("blur", onBlur);
    if (!handedOff && fallbackUrl) window.open(fallbackUrl, "_blank");
  }, 1200);
  return true;
}

/* ---------------- Password hashing ---------------- */
async function sha256Hex(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await window.crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------------- Storage helpers ---------------- */
async function loadOrSeed(key, fallback) {
  try {
    const res = await window.storage.get(key, true);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) { /* not found */ }
  try { await window.storage.set(key, JSON.stringify(fallback), true); } catch (e) {}
  return fallback;
}
async function saveShared(key, value) {
  try { await window.storage.set(key, JSON.stringify(value), true); } catch (e) { console.error(e); }
}

/* ---------------- Cup icon (signature illustration) ---------------- */
function CupIcon({ uid, colors, fillPct = 1, size = 60 }) {
  const gid = `g-${uid}`;
  const cid = `c-${uid}`;
  const cupTop = 15, cupBottom = 64, cupH = cupBottom - cupTop;
  const liquidTop = cupTop + cupH * (1 - fillPct);
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 60 70">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
        <clipPath id={cid}>
          <path d="M9 15 L51 15 L44 65 Q30 69 16 65 Z" />
        </clipPath>
      </defs>
      <path d="M9 15 L51 15 L44 65 Q30 69 16 65 Z" fill="#fff" stroke="#2b2b2b" strokeWidth="1.4" />
      <rect x="6" y={liquidTop} width="48" height={cupBottom - liquidTop + 6} fill={`url(#${gid})`} clipPath={`url(#${cid})`} />
      <ellipse cx="30" cy="15" rx="21" ry="5" fill="#fdfdfb" stroke="#2b2b2b" strokeWidth="1.4" />
      <rect x="27.5" y="1" width="3.4" height="15" rx="1.7" fill="#2b2b2b" transform="rotate(8 30 8)" />
    </svg>
  );
}

/* ---------------- Small building blocks ---------------- */
function SectionTitle({ children, icon }) {
  return (
    <div className="ev-section-title">
      {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      <h2 className="ev-display">{children}</h2>
      <div className="rule" />
    </div>
  );
}
function Money({ v }) {
  return <span>฿{Number(v).toFixed(0)}</span>;
}
function StatusBadge({ status, lang }) {
  const c = STATUS_COLORS[status] || "#999";
  return (
    <span className="ev-status-badge" style={{ background: `${c}22`, color: c }}>
      {T[lang][`status_${status}`] || status}
    </span>
  );
}
function CupProgress({ status, lang }) {
  const idx = STATUS_FLOW.indexOf(status);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", margin: "18px 0" }}>
      {STATUS_FLOW.map((s, i) => (
        <React.Fragment key={s}>
          <div className="cup-progress-step">
            <CupIcon uid={`prog-${s}`} colors={i <= idx ? ["#C17A4F", "#1F3A2E"] : ["#e6e0d2", "#e6e0d2"]} fillPct={i <= idx ? 1 : 0.15} size={34} />
            <span style={{ fontSize: 10, fontWeight: 700, textAlign: "center", color: i <= idx ? "var(--forest)" : "#b8ad94" }}>
              {T[lang][`status_${s}`]}
            </span>
          </div>
          {i < STATUS_FLOW.length - 1 && <div className={`cup-progress-line ${i < idx ? "done" : ""}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ============================================================
   CUSTOMER APP
   ============================================================ */
function CustomerApp({ lang, menu, promotions, banners, orders, members, qrImage, settings, registerMember, registerAccount, onUnlockStaff, placeOrder, view, setView }) {
  const t = T[lang];
  const [page, setPage] = useState("home");
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [detailItem, setDetailItem] = useState(null);
  const [cart, setCart] = useState([]);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [authedPhone, setAuthedPhone] = useState(null);

  const filteredMenu = useMemo(() => {
    return menu.filter((m) => m.available !== false)
      .filter((m) => (activeCat === "all" ? true : m.cat === activeCat))
      .filter((m) => {
        if (!search.trim()) return true;
        const s = search.toLowerCase();
        return m.nameTh.toLowerCase().includes(s) || m.nameEn.toLowerCase().includes(s);
      });
  }, [menu, activeCat, search]);

  const recommended = useMemo(() => menu.filter((m) => m.recommended && m.available !== false), [menu]);

  function addToCart(entry) { setCart((c) => [...c, entry]); }
  function removeFromCart(idx) { setCart((c) => c.filter((_, i) => i !== idx)); }
  function updateQty(idx, delta) {
    setCart((c) => c.map((it, i) => (i === idx ? { ...it, qty: Math.max(1, it.qty + delta) } : it)));
  }
  const cartTotal = cart.reduce((s, it) => s + it.lineTotal, 0);
  const cartCount = cart.reduce((s, it) => s + it.qty, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CustomerHeader lang={lang} page={page} setPage={setPage} cartCount={cartCount} view={view} setView={setView} />
      <div className="ev-scroll" style={{ flex: 1, padding: "18px 20px 90px" }}>
        {page === "home" && (
          <HomePage t={t} lang={lang} recommended={recommended} promotions={promotions} banners={banners} setPage={setPage} setActiveCat={setActiveCat} setDetailItem={setDetailItem} onUnlockStaff[...] }
        )}
        {page === "menu" && (
          <MenuPage t={t} lang={lang} menu={filteredMenu} activeCat={activeCat} setActiveCat={setActiveCat} search={search} setSearch={setSearch} setDetailItem={setDetailItem} />
        )}
        {page === "cart" && (
          <CartPage t={t} lang={lang} cart={cart} removeFromCart={removeFromCart} updateQty={updateQty} total={cartTotal}
            onCheckout={() => setPage("checkout")} promotions={promotions} setPage={setPage} />
        )}
        {page === "checkout" && (
          <CheckoutPage t={t} lang={lang} cart={cart} total={cartTotal} promotions={promotions} members={members} qrImage={qrImage}
            settings={settings} registerMember={registerMember}
            onPlace={(orderInfo) => {
              const order = placeOrder(cart, orderInfo, cartTotal);
              setLastOrderId(order.id);
              setCart([]);
              setPage("tracking");
            }} />
        )}
        {page === "tracking" && (
          <TrackingPage t={t} lang={lang} orders={orders} initialId={lastOrderId} setPage={setPage} />
        )}
        {page === "history" && (
          <HistoryPage t={t} lang={lang} orders={orders} onReorder={(items) => { setCart(items); setPage("cart"); }} />
        )}
        {page === "member" && (
          authedPhone ? (
            <MemberPage t={t} lang={lang} members={members} phone={authedPhone} settings={settings} onLogout={() => setAuthedPhone(null)} />
          ) : (
            <MemberAuthPage t={t} lang={lang} members={members} registerAccount={registerAccount} onAuthed={(phone) => setAuthedPhone(phone)} />
          )
        )}
      </div>
      {detailItem && (
        <ItemDetailModal t={t} lang={lang} item={detailItem} onClose={() => setDetailItem(null)}
          onAdd={(entry) => { addToCart(entry); setDetailItem(null); setPage("cart"); }} />
      )}
    </div>
  );
}

function CustomerHeader({ lang, page, setPage, cartCount, view, setView }) {
  const t = T[lang];
  const tabs = [
    ["home", t.nav_home], ["menu", t.nav_menu], ["cart", `${t.nav_cart}${cartCount ? ` (${cartCount})` : ""}`],
    ["track", t.nav_track], ["history", t.nav_history], ["member", t.nav_member],
  ];
  return (
    <div style={{ padding: "16px 20px 0", background: "var(--forest)", color: "#fff", borderRadius: "16px 16px 0 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="ev-display" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.03em" }}>{t.brand}</div>
          <div style={{ fontSize: 10, opacity: 0.7, letterSpacing: "0.05em" }}>{t.tagline}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 14, paddingBottom: 12, overflowX: "auto" }}>
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setPage(key === "track" ? "tracking" : key)}
            style={{
              border: "none", cursor: "pointer", borderRadius: 999, padding: "7px 13px", fontSize: 12, fontWeight: 700,
              whiteSpace: "nowrap",
              background: (page === key || (key === "track" && page === "tracking")) ? "#fff" : "rgba(255,255,255,0.12)",
              color: (page === key || (key === "track" && page === "tracking")) ? "var(--forest)" : "#fff",
            }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// -- rest of the file continues unchanged --

export default function EvefeeApp() {
  const [lang, setLang] = useState("th");
  const [view, setView] = useState("customer");
  const [loading, setLoading] = useState(true);
  const [staffAccess, setStaffAccess] = useState(false);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("admin") === "1") setStaffAccess(true);
    } catch (e) { /* no window/location available */ }
  }, []);
  const unlockStaffAccess = useCallback(() => setStaffAccess(true), []);
  const [menu, setMenuState] = useState(DEFAULT_MENU);
  const [promotions, setPromotionsState] = useState(DEFAULT_PROMOTIONS);
  const [banners, setBannersState] = useState(DEFAULT_BANNERS);
  const [orders, setOrdersState] = useState([]);
  const [members, setMembersState] = useState({});
  const [qrImage, setQrImageState] = useState("");
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    (async () => {
      const [m, p, bn, o, mem, qr, st] = await Promise.all([
        loadOrSeed("evefee:menu", DEFAULT_MENU),
        loadOrSeed("evefee:promotions", DEFAULT_PROMOTIONS),
        loadOrSeed("evefee:banners", DEFAULT_BANNERS),
        loadOrSeed("evefee:orders", []),
        loadOrSeed("evefee:members", {}),
        loadOrSeed("evefee:qrImage", ""),
        loadOrSeed("evefee:settings", DEFAULT_SETTINGS),
      ]);
      setMenuState(m); setPromotionsState(p); setBannersState(bn); setOrdersState(o); setMembersState(mem); setQrImageState(qr); setSettingsState(st);
      setLoading(false);
    })();
  }, []);

  const setMenu = useCallback((next) => { setMenuState(next); saveShared("evefee:menu", next); }, []);
  const setPromotions = useCallback((next) => { setPromotionsState(next); saveShared("evefee:promotions", next); }, []);
  const setBanners = useCallback((next) => { setBannersState(next); saveShared("evefee:banners", next); }, []);
  const setOrders = useCallback((next) => { setOrdersState(next); saveShared("evefee:orders", next); }, []);
  const setMembers = useCallback((next) => { setMembersState(next); saveShared("evefee:members", next); }, []);
  const setQrImage = useCallback((next) => { setQrImageState(next); saveShared("evefee:qrImage", next); }, []);
  const setSettings = useCallback((next) => { setSettingsState(next); saveShared("evefee:settings", next); }, []);

  const registerMember = useCallback((phone, name) => {
    const key = phone.trim();
    if (!key || members[key]) return;
    const newMember = { phone: key, name: (name || "").trim(), points: 0, totalSpent: 0, joinedAt: Date.now() };
    setMembers({ ...members, [key]: newMember });
  }, [members, setMembers]);

  const registerAccount = useCallback((phone, name, passwordHash) => {
    const key = phone.trim();
    if (!key) return { ok: false, reason: "invalid" };
    const existing = members[key];
    if (existing && existing.password) return { ok: false, reason: "exists" };
    const merged = existing
      ? { ...existing, name: (name || existing.name || "").trim(), password: passwordHash }
      : { phone: key, name: (name || "").trim(), points: 0, totalSpent: 0, joinedAt: Date.now(), password: passwordHash };
    setMembers({ ...members, [key]: merged });
    return { ok: true };
  }, [members, setMembers]);

  const placeOrder = useCallback((cart, info, subtotal) => {
    const id = "A" + String(100 + orders.length + Math.floor(Math.random() * 50)).padStart(3, "0");
    const needsVerification = info.payment === "qr";
    const order = {
      id, createdAt: Date.now(), status: "received",
      items: cart, subtotal, ...info,
      grandTotal: info.grandTotal != null ? info.grandTotal : subtotal,
      pointsAwarded: false,
      slipVerified: !needsVerification,
    };
    const nextOrders = [...orders, order];
    setOrders(nextOrders);

    const redeemed = info.pointsRedeemed || 0;
    if (info.phone && info.phone.trim() && redeemed > 0) {
      const key = info.phone.trim();
      const existing = members[key];
      if (existing) {
        setMembers({ ...members, [key]: { ...existing, points: Math.max(0, existing.points - redeemed) } });
      }
    }
    return order;
  }, [orders, members, setOrders, setMembers]);

  const verifySlip = useCallback((id) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, slipVerified: true } : o)));
  }, [orders, setOrders]);

  const updateOrderStatus = useCallback((id, status) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;

    let nextOrders = orders.map((o) => (o.id === id ? { ...o, status } : o));

    if (status === "completed" && target.status !== "completed" && !target.pointsAwarded) {
      const { earnPerBaht } = getLoyaltyConfig(settings);
      const earned = Math.floor((target.grandTotal || 0) / earnPerBaht);
      if (target.phone && target.phone.trim()) {
        const key = target.phone.trim();
        const existing = members[key] || { phone: key, name: target.name, points: 0, totalSpent: 0, joinedAt: Date.now() };
        setMembers({
          ...members,
          [key]: { ...existing, points: existing.points + earned, totalSpent: existing.totalSpent + (target.grandTotal || 0) },
        });
      }
      nextOrders = nextOrders.map((o) => (o.id === id ? { ...o, pointsAwarded: true, pointsEarned: earned } : o));
    }
    setOrders(nextOrders);
  }, [orders, members, setOrders, setMembers, settings]);

  const resetDemo = useCallback(() => {
    if (!window.confirm(T[lang].reset_confirm)) return;
    setMenu(DEFAULT_MENU);
    setPromotions(DEFAULT_PROMOTIONS);
  }, [lang, setMenu, setPromotions]);

  if (loading) {
    return (
      <div className="evefee-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
        <GlobalStyle />
        <div style={{ color: "var(--forest)", fontWeight: 700 }}>{T[lang].loading}</div>
      </div>
    );
  }

  return (
    <div className="evefee-root" style={{ height: 700, display: "flex", flexDirection: "column" }}>
      <GlobalStyle />
      <div className="ev-fab-toggle">
        <button className={lang === "th" ? "active" : ""} onClick={() => setLang("th")}>TH</button>
        <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
        <span style={{ width: 1, background: "var(--line)", margin: "2px 2px" }} />
        <button className={view === "customer" ? "active" : ""} onClick={() => setView("customer")}>{T[lang].customer_view}</button>
        {(staffAccess || view === "admin") && (
          <button className={view === "admin" ? "active" : ""} onClick={() => setView("admin")}>{T[lang].admin_view}</button>
        )}
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        {view === "customer" ? (
          <CustomerApp lang={lang} menu={menu} promotions={promotions} banners={banners} orders={orders} members={members} qrImage={qrImage}
            settings={settings} registerMember={registerMember} registerAccount={registerAccount} onUnlockStaff={unlockStaffAccess}
            placeOrder={placeOrder} view={view} setView={setView} />
        ) : (
          <AdminApp lang={lang} menu={menu} setMenu={setMenu} promotions={promotions} setPromotions={setPromotions}
            banners={banners} setBanners={setBanners}
            orders={orders} setOrders={setOrders} updateOrderStatus={updateOrderStatus} verifySlip={verifySlip}
            members={members} setMembers={setMembers} qrImage={qrImage} setQrImage={setQrImage}
            settings={settings} setSettings={setSettings} />
        )}
      </div>
    </div>
  );
}

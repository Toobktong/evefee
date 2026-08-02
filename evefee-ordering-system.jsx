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
    add_to_cart: "เพิ่มลงตะกร้า", baht: "บาท", temp: "เลือกอุณหภูมิ", sweet: "ระดับความหวาน", ice: "ระดับน้ำแข็ง",
    addons: "เพิ่มเติม", note: "หมายเหตุ", note_ph: "เช่น หวานน้อย ไม่ใส่วิป", qty: "จำนวน",
    hot: "ร้อน", iced: "เย็น", frappe: "ปั่น", ice_normal: "ปกติ", ice_less: "น้อย", ice_none: "ไม่ใส่",
    cart_title: "ตะกร้าของฉัน", cart_empty: "ยังไม่มีสินค้าในตะกร้า", go_menu: "ไปเลือกเมนู",
    total: "รวมทั้งหมด", checkout: "ดำเนินการสั่งซื้อ", coupon_ph: "ใส่โค้ดคูปอง", apply: "ใช้โค้ด",
    coupon_invalid: "ไม่พบคูปองนี้", coupon_applied: "ใช้คูปองแล้ว", discount: "ส่วนลด",
    checkout_title: "ยืนยันคำสั่งซื้อ", fulfil: "รับสินค้าแบบไหน", pickup: "รับที่ร้าน", delivery: "จัดส่ง",
    delivery_provider: "ผู้ให้บริการจัดส่ง", when: "เวลา", now_order: "สั่งทันที", schedule: "จองล่วงหน้า",
    payment: "วิธีชำระเงิน", qr: "QR PromptPay", transfer: "โอนเงิน", card: "บัตรเครดิต", cash: "เงินสด",
    name: "ชื่อผู้สั่ง", phone: "เบอร์โทร (ใช้ค้นหาประวัติ)", address: "ที่อยู่จัดส่ง", place_order: "ยืนยันสั่งซื้อ",
    order_placed: "สั่งซื้อสำเร็จ!", order_no: "หมายเลขออเดอร์", track_this: "ติดตามออเดอร์นี้",
    status_received: "ได้รับออเดอร์", status_preparing: "กำลังทำ", status_ready: "พร้อมรับ",
    status_delivering: "กำลังจัดส่ง", status_completed: "เสร็จสิ้น", status_cancelled: "ยกเลิก",
    track_title: "ติดตามสถานะออเดอร์", enter_order_id: "กรอกหมายเลขออเดอร์", track_btn: "ค้นหา",
    not_found: "ไม่พบออเดอร์นี้", history_title: "ประวัติการสั่งซื้อ", enter_phone: "กรอกเบอร์โทรศัพท์",
    find: "ค้นหา", order_again: "สั่งอีกครั้ง", items: "รายการ", no_history: "ไม่พบประวัติการสั่งซื้อ",
    customer_view: "ลูกค้า", admin_view: "ร้านค้า", logout: "ออกจากระบบ",
    dash_today_sales: "ยอดขายวันนี้", dash_today_orders: "ออเดอร์วันนี้", dash_top_item: "เมนูขายดี",
    dash_new_cust: "ลูกค้าวันนี้", nav_dashboard: "ภาพรวม", nav_orders: "จัดการออเดอร์", nav_kitchen: "จอครัว",
    nav_menu_mgmt: "จัดการเมนู", nav_promo: "โปรโมชั่น", nav_reports: "รายงาน", nav_reset: "รีเซ็ตข้อมูลตัวอย่าง",
    order_mgmt_title: "รายการออเดอร์ทั้งหมด", col_order: "ออเดอร์", col_time: "เวลา", col_customer: "ลูกค้า",
    col_items: "รายการ", col_total: "ยอดรวม", col_status: "สถานะ", col_action: "จัดการ",
    kitchen_title: "จอครัว — บาริสต้า", start: "เริ่มทำ", done: "เสร็จแล้ว", no_active: "ไม่มีออเดอร์ที่ต้องทำตอนนี้",
    menu_mgmt_title: "จัดการเมนู", add_item: "+ เพิ่มเมนู", edit: "แก้ไข", delete: "ลบ", available: "ขายอยู่",
    unavailable: "ปิดขาย", item_name_th: "ชื่อ (ไทย)", item_name_en: "ชื่อ (อังกฤษ)", item_price: "ราคา",
    item_cat: "หมวดหมู่", save: "บันทึก", cancel: "ยกเลิก", confirm_delete: "ยืนยันการลบเมนูนี้?",
    promo_title: "โปรโมชั่น & คูปอง", add_promo: "+ สร้างโปรโมชั่น", promo_name: "ชื่อโปรโมชั่น",
    promo_code: "โค้ดคูปอง", promo_type: "ประเภทส่วนลด", percent: "ลดเป็น %", fixed: "ลดเป็นจำนวนเงิน",
    promo_value: "มูลค่าส่วนลด", reports_title: "รายงานสรุป", reports_sales: "ยอดขายรวม", reports_orders: "จำนวนออเดอร์",
    reports_avg: "ค่าเฉลี่ยต่อออเดอร์", reports_top: "เมนูขายดี 5 อันดับ", reports_by_cat: "ยอดขายตามหมวดหมู่",
    loading: "กำลังโหลด...", recommended: "แนะนำ", cat_coffee: "กาแฟ", cat_matcha: "มัทฉะ", cat_tea: "ชา",
    cat_special: "พิเศษ", search_no_result: "ไม่พบเมนูที่ค้นหา", welcome_admin: "สวัสดี, ผู้จัดการร้าน",
    reset_confirm: "ต้องการรีเซ็ตข้อมูลเมนู/โปรโมชั่นกลับเป็นค่าเริ่มต้นหรือไม่? (ออเดอร์จะไม่ถูกลบ)",
    all_cat: "ทั้งหมด",
    nav_member: "สมาชิก", member_title: "สมาชิก EVEFEE", member_lookup_ph: "กรอกเบอร์โทรศัพท์เพื่อดูแต้มสะสม",
    member_not_found: "ยังไม่พบข้อมูลสมาชิก สั่งซื้อครั้งแรกเพื่อเริ่มสะสมแต้มได้เลย",
    member_points: "แต้มสะสม", member_spent: "ยอดใช้จ่ายสะสม", member_joined: "สมาชิกตั้งแต่",
    tier_bronze: "Bronze", tier_silver: "Silver", tier_gold: "Gold",
    earn_info: "ทุกๆ ฿10 ที่ใช้จ่าย รับ 1 แต้ม • 1 แต้ม = ส่วนลด ฿0.5",
    to_next_tier: "อีกถึงระดับ", redeem_points_label: "ใช้แต้มสะสมแลกส่วนลด", redeem_points_ph: "จำนวนแต้มที่ใช้",
    redeem_available: "มีแต้มสะสม", points_discount: "ส่วนลดจากแต้ม",
    qr_settings_title: "ตั้งค่า QR PromptPay", qr_upload_label: "อัปโหลดรูป QR PromptPay",
    qr_current: "QR ปัจจุบัน", qr_remove: "ลบรูป QR", qr_none_admin: "ยังไม่ได้อัปโหลดรูป QR",
    qr_missing_customer: "ร้านค้ายังไม่ได้อัปโหลด QR PromptPay กรุณาเลือกวิธีชำระเงินอื่น",
    nav_settings: "ตั้งค่า", nav_members: "สมาชิก",
    members_title: "จัดการสมาชิก", col_name: "ชื่อ", col_phone: "เบอร์โทร", col_tier: "ระดับ",
    col_points: "แต้ม", col_spent: "ยอดใช้จ่าย", col_orders: "จำนวนออเดอร์", no_members: "ยังไม่มีข้อมูลสมาชิก",
    edit_promo: "แก้ไขโปรโมชั่น",
    member_auth_tagline: "เข้าสู่ระบบหรือสมัครสมาชิกเพื่อเริ่มสั่งซื้อและสะสมแต้ม",
    tab_login: "เข้าสู่ระบบ", tab_signup: "สมัครสมาชิก",
    member_phone: "เบอร์โทรศัพท์", member_password: "รหัสผ่าน", member_confirm_password: "ยืนยันรหัสผ่าน",
    signup_btn: "สมัครสมาชิก", login_btn: "เข้าสู่ระบบ",
    err_phone_exists: "เบอร์นี้สมัครสมาชิกแล้ว กรุณาเข้าสู่ระบบ",
    err_invalid_login: "เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง",
    err_password_mismatch: "รหัสผ่านไม่ตรงกัน",
    err_required_fields: "กรุณากรอกข้อมูลให้ครบถ้วน",
    logged_in_as: "เข้าสู่ระบบในชื่อ",
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
    nav_menu_mgmt: "Menu", nav_promo: "Promotions", nav_reports: "Reports", nav_reset: "Reset Sample Data",
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
    member_points: "Points Balance", member_spent: "Total Spent", member_joined: "Member Since",
    tier_bronze: "Bronze", tier_silver: "Silver", tier_gold: "Gold",
    earn_info: "Earn 1 point per ฿10 spent • 1 point = ฿0.5 discount",
    to_next_tier: "to reach", redeem_points_label: "Redeem points for discount", redeem_points_ph: "Points to redeem",
    redeem_available: "Points available", points_discount: "Points Discount",
    qr_settings_title: "QR PromptPay Settings", qr_upload_label: "Upload QR PromptPay Image",
    qr_current: "Current QR", qr_remove: "Remove QR", qr_none_admin: "No QR image uploaded yet",
    qr_missing_customer: "The store hasn't uploaded a QR PromptPay yet. Please choose another payment method.",
    nav_settings: "Settings", nav_members: "Members",
    members_title: "Member Management", col_name: "Name", col_phone: "Phone", col_tier: "Tier",
    col_points: "Points", col_spent: "Spent", col_orders: "Orders", no_members: "No member data yet",
    edit_promo: "Edit Promotion",
    member_auth_tagline: "Login or sign up to start ordering and earning points",
    tab_login: "Login", tab_signup: "Sign Up",
    member_phone: "Phone Number", member_password: "Password", member_confirm_password: "Confirm Password",
    signup_btn: "Sign Up", login_btn: "Login",
    err_phone_exists: "This phone number is already registered. Please login.",
    err_invalid_login: "Incorrect phone number or password",
    err_password_mismatch: "Passwords do not match",
    err_required_fields: "Please fill in all fields",
    logged_in_as: "Logged in as",
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
const DEFAULT_MENU = [
  { id: "c1", cat: "coffee", nameTh: "อเมริกาโน่มะพร้าว", nameEn: "Coconut Americano", price: 40, colors: ["#c9a876", "#2b1810"], hot: true, recommended: false, available: true },
  { id: "c2", cat: "coffee", nameTh: "อเมริกาโน่น้ำผึ้งมะนาว", nameEn: "Honey Lemon Americano", price: 40, colors: ["#f3c94a", "#e08a1f"], hot: false, recommended: false, available: true },
  { id: "c3", cat: "coffee", nameTh: "ยูสุโคลบลู", nameEn: "Yuzu Cold Blue", price: 90, colors: ["#e0c68a", "#2b1810"], hot: false, recommended: false, available: true },
  { id: "c4", cat: "coffee", nameTh: "โคโค่นัทลาเต้", nameEn: "Coconut Latte", price: 60, colors: ["#e8dcc4", "#8a5a34"], hot: true, recommended: false, available: true },
  { id: "c5", cat: "coffee", nameTh: "โคโค่นัทมัทฉะโฟม", nameEn: "Coconut Matcha Cold Foam", price: 95, colors: ["#e8dcc4", "#5c8a3a"], hot: false, recommended: false, available: true },
  { id: "m1", cat: "matcha", nameTh: "โคโค่นัทเผือก", nameEn: "Coconut Taro", price: 60, colors: ["#e6d6ec", "#9b7fc9"], hot: false, recommended: false, available: true },
  { id: "m2", cat: "matcha", nameTh: "เพียวมัทฉะน้ำมะพร้าว", nameEn: "Pure Matcha Coconut", price: 80, colors: ["#d8ecc0", "#5c8a3a"], hot: false, recommended: false, available: true },
  { id: "m3", cat: "matcha", nameTh: "เพียวมัทฉะน้ำผึ้งมะนาว", nameEn: "Pure Matcha Honey Lemon", price: 80, colors: ["#f3d94a", "#4c7a34"], hot: false, recommended: false, available: true },
  { id: "m4", cat: "matcha", nameTh: "มัทฉะลาเต้เผือก", nameEn: "Matcha Taro Latte", price: 120, colors: ["#c9a8e0", "#5c8a3a"], hot: false, recommended: true, available: true },
  { id: "m5", cat: "matcha", nameTh: "มัทฉะสตรอเบอร์รี่", nameEn: "Matcha Strawberry", price: 95, colors: ["#f0a8c0", "#4c7a34"], hot: false, recommended: true, available: true },
  { id: "te1", cat: "tea", nameTh: "ชาไทยน้ำส้ม", nameEn: "Thai Tea Orange Juice", price: 40, colors: ["#f0803c", "#c1461f"], hot: false, recommended: false, available: true },
  { id: "te2", cat: "tea", nameTh: "น้ำผึ้งมะนาวโซดา", nameEn: "Honey Lemon Soda", price: 30, colors: ["#f3e8a0", "#e0c060"], hot: false, recommended: false, available: true },
  { id: "te3", cat: "tea", nameTh: "ชาไทยซิกเนเจอร์", nameEn: "Signature Thai Tea", price: 40, colors: ["#f0a03c", "#c1461f"], hot: false, recommended: true, available: true },
  { id: "sp1", cat: "special", nameTh: "สตรอเบอร์รี่โกโก้", nameEn: "Strawberry Cocoa", price: 45, colors: ["#e89ca8", "#3c2415"], hot: false, recommended: false, available: true },
  { id: "sp2", cat: "special", nameTh: "สตรอเบอร์รี่ชีสเค้ก", nameEn: "Strawberry Cheesecake", price: 50, colors: ["#f0e8d0", "#c17a4f"], hot: false, recommended: false, available: true },
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
const ADMIN_EMAIL = "manager@evefee.com";
const ADMIN_PASS = "adminmanager";
const STATUS_FLOW = ["received", "preparing", "ready", "completed"];
const STATUS_COLORS = {
  received: "#D4A24C", preparing: "#C17A4F", ready: "#7C9A82",
  delivering: "#7C9A82", completed: "#1F3A2E", cancelled: "#B5493A",
};

/* ---------------- Membership / loyalty points ---------------- */
const EARN_PER_BAHT = 10; // spend this many baht to earn 1 point
const POINT_VALUE = 0.5;  // baht discount per point redeemed
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
function CustomerApp({ lang, menu, promotions, orders, members, setMembers, placeOrder, view, setView }) {
  const t = T[lang];
  const [page, setPage] = useState("home");
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [detailItem, setDetailItem] = useState(null);
  const [cart, setCart] = useState([]);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [currentMember, setCurrentMember] = useState(null);

  // Keep the logged-in member's points/spend in sync as the shared members list updates (e.g. after an order).
  useEffect(() => {
    if (currentMember) {
      const updated = members.find((m) => m.phone === currentMember.phone);
      if (updated) setCurrentMember(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members]);

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

  if (!currentMember) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <MemberAuthPage t={t} members={members}
          onAuth={(member, isNew) => {
            if (isNew) setMembers([...members, member]);
            setCurrentMember(member);
          }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CustomerHeader lang={lang} page={page} setPage={setPage} cartCount={cartCount} view={view} setView={setView}
        currentMember={currentMember} onLogout={() => setCurrentMember(null)} />
      <div className="ev-scroll" style={{ flex: 1, padding: "18px 20px 90px" }}>
        {page === "home" && (
          <HomePage t={t} lang={lang} recommended={recommended} promotions={promotions} setPage={setPage} setActiveCat={setActiveCat} setDetailItem={setDetailItem} />
        )}
        {page === "menu" && (
          <MenuPage t={t} lang={lang} menu={filteredMenu} activeCat={activeCat} setActiveCat={setActiveCat} search={search} setSearch={setSearch} setDetailItem={setDetailItem} />
        )}
        {page === "cart" && (
          <CartPage t={t} lang={lang} cart={cart} removeFromCart={removeFromCart} updateQty={updateQty} total={cartTotal}
            onCheckout={() => setPage("checkout")} promotions={promotions} setPage={setPage} />
        )}
        {page === "checkout" && (
          <CheckoutPage t={t} lang={lang} cart={cart} total={cartTotal} promotions={promotions} currentMember={currentMember}
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
          <HistoryPage t={t} lang={lang} orders={orders} currentMember={currentMember} onReorder={(items) => { setCart(items); setPage("cart"); }} />
        )}
        {page === "member" && (
          <MemberPage t={t} lang={lang} member={currentMember} />
        )}
      </div>
      {detailItem && (
        <ItemDetailModal t={t} lang={lang} item={detailItem} onClose={() => setDetailItem(null)}
          onAdd={(entry) => { addToCart(entry); setDetailItem(null); setPage("cart"); }} />
      )}
    </div>
  );
}

function CustomerHeader({ lang, page, setPage, cartCount, view, setView, currentMember, onLogout }) {
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
        {currentMember && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, opacity: 0.75 }}>{t.logged_in_as}</div>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{currentMember.name || currentMember.phone}</div>
            </div>
            <button onClick={onLogout} style={{
              border: "none", cursor: "pointer", borderRadius: 999, padding: "6px 12px", fontSize: 11.5, fontWeight: 700,
              background: "rgba(255,255,255,0.14)", color: "#fff",
            }}>
              ↩ {t.logout}
            </button>
          </div>
        )}
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

function HomePage({ t, lang, recommended, promotions, setPage, setActiveCat, setDetailItem }) {
  return (
    <div>
      <div className="ev-card" style={{ padding: 22, marginBottom: 22, background: "linear-gradient(135deg,#EFE7D3,var(--cream-soft))" }}>
        <div className="ev-eyebrow">🌿 {t.tagline}</div>
        <h1 className="ev-display" style={{ fontSize: 26, margin: "8px 0 6px", color: "var(--forest)" }}>{t.brand}</h1>
        <p style={{ fontSize: 13, opacity: 0.75, margin: "0 0 14px", maxWidth: 320 }}>
          {lang === "th" ? "วัตถุดิบสดใหม่ คุณภาพพรีเมียม ส่งตรงถึงมือคุณ" : "Fresh ingredients, premium quality, delivered fresh to you."}
        </p>
        <button className="ev-btn ev-btn-primary" onClick={() => setPage("menu")}>{t.nav_menu} →</button>
      </div>

      {promotions && promotions.length > 0 && (
        <>
          <SectionTitle icon="🏷️">{t.promo_title}</SectionTitle>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6, marginBottom: 24 }}>
            {promotions.map((p) => (
              <div key={p.id} style={{
                minWidth: 190, flexShrink: 0, borderRadius: 14, padding: 16,
                background: "linear-gradient(135deg,var(--forest),var(--forest-deep))", color: "#fff",
              }}>
                <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 700, marginBottom: 6 }}>{lang === "th" ? p.name_th : p.name_en}</div>
                <div className="ev-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
                  {p.type === "percent" ? `-${p.value}%` : `-฿${p.value}`}
                </div>
                <div style={{
                  display: "inline-block", fontSize: 12, fontWeight: 800, letterSpacing: "0.05em",
                  background: "rgba(255,255,255,0.15)", border: "1px dashed rgba(255,255,255,0.5)",
                  borderRadius: 8, padding: "4px 10px",
                }}>{p.code}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionTitle icon="⭐">{t.bestseller}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
        {recommended.map((item) => (
          <MenuCard key={item.id} item={item} lang={lang} t={t} onClick={() => setDetailItem(item)} />
        ))}
      </div>

      <SectionTitle icon="☕">{t.categories}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
        {CATS.map((c) => (
          <button key={c} onClick={() => { setActiveCat(c); setPage("menu"); }}
            className="ev-card" style={{ padding: 16, textAlign: "left", cursor: "pointer", border: "1px solid var(--line)" }}>
            <CupIcon uid={`home-${c}`} colors={CAT_COLORS[c]} size={34} />
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 6 }}>{t[`cat_${c}`]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MenuCard({ item, lang, t, onClick }) {
  return (
    <button onClick={onClick} className="ev-card" style={{ padding: 12, textAlign: "left", cursor: "pointer", border: "1px solid var(--line)" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CupIcon uid={item.id} colors={item.colors} size={54} />
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 8, minHeight: 32 }}>{lang === "th" ? item.nameTh : item.nameEn}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--terracotta-deep)", marginTop: 4 }}><Money v={item.price} /></div>
    </button>
  );
}

function MenuPage({ t, lang, menu, activeCat, setActiveCat, search, setSearch, setDetailItem }) {
  return (
    <div>
      <input className="ev-input" placeholder={t.search_ph} value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 14 }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 18, overflowX: "auto", paddingBottom: 4 }}>
        {["all", ...CATS].map((c) => (
          <button key={c} onClick={() => setActiveCat(c)}
            className="ev-chip" style={{
              cursor: "pointer", border: "none", whiteSpace: "nowrap",
              background: activeCat === c ? "var(--forest)" : "rgba(31,58,46,0.08)",
              color: activeCat === c ? "#fff" : "var(--forest)",
            }}>
            {c === "all" ? t.all_cat : t[`cat_${c}`]}
          </button>
        ))}
      </div>
      {menu.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, opacity: 0.6, fontSize: 13 }}>{t.search_no_result}</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12 }}>
          {menu.map((item) => <MenuCard key={item.id} item={item} lang={lang} t={t} onClick={() => setDetailItem(item)} />)}
        </div>
      )}
    </div>
  );
}

function ItemDetailModal({ t, lang, item, onClose, onAdd }) {
  const [temp, setTemp] = useState(item.hot ? "hot" : "iced");
  const [sweet, setSweet] = useState(100);
  const [ice, setIce] = useState("normal");
  const [selAddons, setSelAddons] = useState([]);
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);

  const addonTotal = selAddons.reduce((s, id) => s + ADDONS.find((a) => a.id === id).price, 0);
  const unitPrice = item.price + addonTotal;
  const lineTotal = unitPrice * qty;

  function toggleAddon(id) {
    setSelAddons((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <div className="ev-modal-backdrop" onClick={onClose}>
      <div className="ev-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <CupIcon uid={`detail-${item.id}`} colors={item.colors} size={80} />
        </div>
        <h3 className="ev-display" style={{ textAlign: "center", margin: "4px 0 2px", fontSize: 20 }}>{lang === "th" ? item.nameTh : item.nameEn}</h3>
        <div style={{ textAlign: "center", fontWeight: 800, color: "var(--terracotta-deep)", marginBottom: 18 }}><Money v={item.price} /> {t.baht}</div>

        <label className="ev-label">{t.temp}</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["hot", "iced", "frappe"].map((opt) => (
            (opt === "hot" && !item.hot) ? null :
            <button key={opt} onClick={() => setTemp(opt)} className="ev-btn"
              style={{ flex: 1, padding: "8px 4px", fontSize: 12.5, background: temp === opt ? "var(--forest)" : "#fff", color: temp === opt ? "#fff" : "var(--cocoa)", border: "1.5px solid var(--line)" }}>
              {t[opt]}
            </button>
          ))}
        </div>

        <label className="ev-label">{t.sweet}</label>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[100, 75, 50, 25, 0].map((s) => (
            <button key={s} onClick={() => setSweet(s)} className="ev-btn"
              style={{ flex: 1, padding: "7px 2px", fontSize: 11.5, background: sweet === s ? "var(--sage)" : "#fff", color: sweet === s ? "#fff" : "var(--cocoa)", border: "1.5px solid var(--line)" }}>
              {s}%
            </button>
          ))}
        </div>

        <label className="ev-label">{t.ice}</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["normal", "less", "none"].map((opt) => (
            <button key={opt} onClick={() => setIce(opt)} className="ev-btn"
              style={{ flex: 1, padding: "8px 4px", fontSize: 12.5, background: ice === opt ? "var(--gold)" : "#fff", color: ice === opt ? "#fff" : "var(--cocoa)", border: "1.5px solid var(--line)" }}>
              {t[`ice_${opt}`]}
            </button>
          ))}
        </div>

        <label className="ev-label">{t.addons}</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          {ADDONS.map((a) => (
            <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={selAddons.includes(a.id)} onChange={() => toggleAddon(a.id)} />
              <span style={{ flex: 1 }}>{lang === "th" ? a.th : a.en}</span>
              <span style={{ fontWeight: 700, color: "var(--terracotta-deep)" }}>+฿{a.price}</span>
            </label>
          ))}
        </div>

        <label className="ev-label">{t.note}</label>
        <textarea className="ev-input" rows={2} placeholder={t.note_ph} value={note} onChange={(e) => setNote(e.target.value)} style={{ marginBottom: 16, resize: "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <span className="ev-label" style={{ marginBottom: 0 }}>{t.qty}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span style={{ fontWeight: 800, minWidth: 18, textAlign: "center" }}>{qty}</span>
            <button className="qty-btn" onClick={() => setQty((q) => q + 1)}>+</button>
          </div>
        </div>

        <button className="ev-btn ev-btn-terracotta" style={{ width: "100%", fontSize: 15, padding: "13px" }}
          onClick={() => onAdd({
            itemId: item.id, nameTh: item.nameTh, nameEn: item.nameEn, colors: item.colors,
            temp, sweet, ice, addons: selAddons, note, qty, unitPrice, lineTotal,
          })}>
          {t.add_to_cart} · <Money v={lineTotal} />
        </button>
      </div>
    </div>
  );
}

function CartPage({ t, lang, cart, removeFromCart, updateQty, total, onCheckout, promotions, setPage }) {
  if (cart.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🛒</div>
        <p style={{ opacity: 0.6, marginBottom: 16 }}>{t.cart_empty}</p>
        <button className="ev-btn ev-btn-primary" onClick={() => setPage("menu")}>{t.go_menu}</button>
      </div>
    );
  }
  return (
    <div>
      <SectionTitle icon="🛒">{t.cart_title}</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {cart.map((it, i) => (
          <div key={i} className="ev-card" style={{ padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
            <CupIcon uid={`cart-${i}`} colors={it.colors} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{lang === "th" ? it.nameTh : it.nameEn}</div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>
                {t[it.temp]} · {t.sweet} {it.sweet}% · {t[`ice_${it.ice}`]}
                {it.addons.length > 0 && ` · +${it.addons.map((a) => (lang === "th" ? ADDONS.find((x) => x.id === a).th : ADDONS.find((x) => x.id === a).en)).join(", ")}`}
              </div>
              {it.note && <div style={{ fontSize: 11, opacity: 0.5, fontStyle: "italic" }}>"{it.note}"</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button className="qty-btn" style={{ width: 24, height: 24, fontSize: 13 }} onClick={() => updateQty(i, -1)}>−</button>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{it.qty}</span>
                <button className="qty-btn" style={{ width: 24, height: 24, fontSize: 13 }} onClick={() => updateQty(i, 1)}>+</button>
              </div>
              <div style={{ fontWeight: 800, fontSize: 13, color: "var(--terracotta-deep)" }}><Money v={it.lineTotal} /></div>
              <button onClick={() => removeFromCart(i)} style={{ background: "none", border: "none", color: "var(--danger)", fontSize: 11, cursor: "pointer", padding: 0 }}>
                {t.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="ev-card" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16 }}>
          <span>{t.total}</span><span><Money v={total} /></span>
        </div>
        <button className="ev-btn ev-btn-primary" style={{ width: "100%", marginTop: 14 }} onClick={onCheckout}>{t.checkout}</button>
      </div>
    </div>
  );
}

function CheckoutPage({ t, lang, cart, total, promotions, currentMember, onPlace }) {
  const [fulfil, setFulfil] = useState("pickup");
  const [deliveryProvider, setDeliveryProvider] = useState("grab");
  const [when, setWhen] = useState("now");
  const [payment, setPayment] = useState("qr");
  const [name, setName] = useState(currentMember.name || "");
  const [address, setAddress] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [redeemPoints, setRedeemPoints] = useState(0);
  const phone = currentMember.phone;

  function applyCoupon() {
    const found = promotions.find((p) => p.code.toLowerCase() === couponInput.trim().toLowerCase());
    if (!found) { setCouponMsg(t.coupon_invalid); setCoupon(null); return; }
    setCoupon(found); setCouponMsg(t.coupon_applied);
  }
  const discount = coupon ? (coupon.type === "percent" ? Math.round(total * (coupon.value / 100)) : coupon.value) : 0;
  const maxRedeemable = Math.min(currentMember.points, Math.floor(Math.max(0, total - discount) / POINT_VALUE));
  const effectiveRedeem = Math.min(redeemPoints, maxRedeemable);
  const pointsDiscount = effectiveRedeem * POINT_VALUE;
  const grandTotal = Math.max(0, total - discount - pointsDiscount);
  const canPlace = name.trim() && (fulfil === "pickup" || address.trim());

  return (
    <div>
      <SectionTitle icon="✅">{t.checkout_title}</SectionTitle>

      <label className="ev-label">{t.fulfil}</label>
      <div className="ev-tabbar" style={{ marginBottom: 16 }}>
        <button className={fulfil === "pickup" ? "active" : ""} onClick={() => setFulfil("pickup")}>{t.pickup}</button>
        <button className={fulfil === "delivery" ? "active" : ""} onClick={() => setFulfil("delivery")}>{t.delivery}</button>
      </div>

      {fulfil === "delivery" && (
        <>
          <label className="ev-label">{t.delivery_provider}</label>
          <div className="ev-tabbar" style={{ marginBottom: 16 }}>
            <button className={deliveryProvider === "grab" ? "active" : ""} onClick={() => setDeliveryProvider("grab")}>Grab</button>
            <button className={deliveryProvider === "lalamove" ? "active" : ""} onClick={() => setDeliveryProvider("lalamove")}>Lalamove</button>
          </div>
        </>
      )}

      <label className="ev-label">{t.when}</label>
      <div className="ev-tabbar" style={{ marginBottom: 16 }}>
        <button className={when === "now" ? "active" : ""} onClick={() => setWhen("now")}>{t.now_order}</button>
        <button className={when === "schedule" ? "active" : ""} onClick={() => setWhen("schedule")}>{t.schedule}</button>
      </div>

      <label className="ev-label">{t.payment}</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {["qr", "transfer", "card", "cash"].map((p) => (
          <button key={p} onClick={() => setPayment(p)} className="ev-btn"
            style={{ padding: "10px", fontSize: 12.5, background: payment === p ? "var(--forest)" : "#fff", color: payment === p ? "#fff" : "var(--cocoa)", border: "1.5px solid var(--line)" }}>
            {t[p]}
          </button>
        ))}
      </div>

      <label className="ev-label">{t.name}</label>
      <input className="ev-input" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 12 }} />
      <label className="ev-label">{t.phone}</label>
      <input className="ev-input" value={phone} disabled style={{ marginBottom: 12, opacity: 0.7 }} />

      <div className="ev-card" style={{ padding: 14, marginBottom: 12, background: "var(--cream)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>{t.redeem_available}: {currentMember.points}</span>
          <TierBadge tier={tierOf(currentMember.spent)} t={t} />
        </div>
        <label className="ev-label">{t.redeem_points_label}</label>
        <input className="ev-input" type="number" min={0} max={maxRedeemable} placeholder={t.redeem_points_ph}
          value={redeemPoints === 0 ? "" : redeemPoints}
          onChange={(e) => setRedeemPoints(Math.max(0, Math.min(Number(e.target.value) || 0, maxRedeemable)))}
          disabled={maxRedeemable === 0} />
      </div>

      {fulfil === "delivery" && (
        <>
          <label className="ev-label">{t.address}</label>
          <textarea className="ev-input" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} style={{ marginBottom: 12, resize: "none" }} />
        </>
      )}

      <label className="ev-label">{t.coupon_ph}</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
        <input className="ev-input" placeholder={t.coupon_ph} value={couponInput} onChange={(e) => setCouponInput(e.target.value)} />
        <button className="ev-btn ev-btn-outline" onClick={applyCoupon}>{t.apply}</button>
      </div>
      {couponMsg && <div style={{ fontSize: 12, color: coupon ? "var(--forest)" : "var(--danger)", marginBottom: 12 }}>{couponMsg}</div>}

      <div className="ev-card" style={{ padding: 16, marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
          <span>{t.total}</span><span><Money v={total} /></span>
        </div>
        {discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "var(--forest)" }}>
            <span>{t.discount}</span><span>-<Money v={discount} /></span>
          </div>
        )}
        {pointsDiscount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "var(--forest)" }}>
            <span>{t.points_discount}</span><span>-<Money v={pointsDiscount} /></span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, marginTop: 6 }}>
          <span>{t.total}</span><span><Money v={grandTotal} /></span>
        </div>
        <button className="ev-btn ev-btn-terracotta" style={{ width: "100%", marginTop: 14 }} disabled={!canPlace}
          onClick={() => onPlace({
            fulfil, deliveryProvider, when, payment, name, phone, address,
            coupon: coupon ? coupon.code : null, discount,
            redeemedPoints: effectiveRedeem, pointsDiscount, grandTotal,
          })}>
          {t.place_order}
        </button>
      </div>
    </div>
  );
}

function TrackingPage({ t, lang, orders, initialId, setPage }) {
  const [orderId, setOrderId] = useState(initialId || "");
  const [searched, setSearched] = useState(!!initialId);
  const order = orders.find((o) => o.id === orderId);

  useEffect(() => { if (initialId) { setOrderId(initialId); setSearched(true); } }, [initialId]);

  return (
    <div>
      <SectionTitle icon="🚚">{t.track_title}</SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input className="ev-input" placeholder={t.enter_order_id} value={orderId} onChange={(e) => setOrderId(e.target.value.toUpperCase())} />
        <button className="ev-btn ev-btn-primary" onClick={() => setSearched(true)}>{t.track_btn}</button>
      </div>
      {searched && !order && <div style={{ textAlign: "center", opacity: 0.6, padding: 30 }}>{t.not_found}</div>}
      {order && (
        <div className="ev-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="ev-eyebrow">{t.order_no}</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{order.id}</div>
            </div>
            <StatusBadge status={order.status} lang={lang} />
          </div>
          <CupProgress status={order.status} lang={lang} />
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
            {order.items.map((it, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                <span>{it.qty}× {lang === "th" ? it.nameTh : it.nameEn}</span>
                <span><Money v={it.lineTotal} /></span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, marginTop: 8, fontSize: 14 }}>
              <span>{t.total}</span><span><Money v={order.grandTotal} /></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryPage({ t, lang, orders, currentMember, onReorder }) {
  const matched = orders.filter((o) => o.phone === currentMember.phone).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <SectionTitle icon="📜">{t.history_title}</SectionTitle>
      {matched.length === 0 && <div style={{ textAlign: "center", opacity: 0.6, padding: 30 }}>{t.no_history}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {matched.map((o) => (
          <div key={o.id} className="ev-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{o.id}</div>
                <div style={{ fontSize: 11, opacity: 0.55 }}>{new Date(o.createdAt).toLocaleString(lang === "th" ? "th-TH" : "en-US")}</div>
              </div>
              <StatusBadge status={o.status} lang={lang} />
            </div>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>{o.items.length} {t.items} · <Money v={o.grandTotal} /></div>
            <button className="ev-btn ev-btn-outline" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => onReorder(o.items)}>{t.order_again}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemberAuthPage({ t, members, onAuth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function switchMode(next) {
    setMode(next); setError("");
  }

  function submit() {
    const p = phone.trim();
    if (mode === "signup") {
      if (!name.trim() || !p || !password) { setError(t.err_required_fields); return; }
      if (password !== confirmPassword) { setError(t.err_password_mismatch); return; }
      if (members.find((m) => m.phone === p)) { setError(t.err_phone_exists); return; }
      const newMember = { phone: p, name: name.trim(), password, points: 0, spent: 0, orderCount: 0, joinedAt: Date.now() };
      onAuth(newMember, true);
    } else {
      if (!p || !password) { setError(t.err_required_fields); return; }
      const found = members.find((m) => m.phone === p && m.password === password);
      if (!found) { setError(t.err_invalid_login); return; }
      onAuth(found, false);
    }
  }
  function handleKeyDown(e) { if (e.key === "Enter") submit(); }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 20 }}>
      <div className="ev-card" style={{ padding: 28, width: "100%", maxWidth: 340 }}>
        <div className="ev-display" style={{ fontSize: 24, textAlign: "center", color: "var(--forest)", marginBottom: 4 }}>{t.brand}</div>
        <div style={{ textAlign: "center", fontSize: 12.5, opacity: 0.65, marginBottom: 20 }}>{t.member_auth_tagline}</div>

        <div className="ev-tabbar" style={{ marginBottom: 18 }}>
          <button className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>{t.tab_login}</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")}>{t.tab_signup}</button>
        </div>

        {mode === "signup" && (
          <>
            <label className="ev-label">{t.name}</label>
            <input className="ev-input" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} style={{ marginBottom: 12 }} />
          </>
        )}
        <label className="ev-label">{t.member_phone}</label>
        <input className="ev-input" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={handleKeyDown} style={{ marginBottom: 12 }} />
        <label className="ev-label">{t.member_password}</label>
        <input className="ev-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} style={{ marginBottom: 12 }} />
        {mode === "signup" && (
          <>
            <label className="ev-label">{t.member_confirm_password}</label>
            <input className="ev-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={handleKeyDown} style={{ marginBottom: 12 }} />
          </>
        )}

        {error && <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 10 }}>{error}</div>}

        <button className="ev-btn ev-btn-primary" style={{ width: "100%" }} onClick={submit}>
          {mode === "login" ? t.login_btn : t.signup_btn}
        </button>
      </div>
    </div>
  );
}

function MemberPage({ t, lang, member }) {
  const tier = tierOf(member.spent);
  const next = nextTierInfo(member.spent);

  return (
    <div>
      <SectionTitle icon="🎖️">{t.member_title}</SectionTitle>
      <div className="ev-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div className="ev-eyebrow" style={{ marginBottom: 4 }}>{member.name || member.phone}</div>
            <div style={{ fontSize: 11, opacity: 0.55 }}>
              {t.member_joined} {new Date(member.joinedAt).toLocaleDateString(lang === "th" ? "th-TH" : "en-US")}
            </div>
          </div>
          <TierBadge tier={tier} t={t} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div className="ev-card" style={{ padding: 14, background: "var(--cream)" }}>
            <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 700, marginBottom: 4 }}>{t.member_points}</div>
            <div className="ev-display" style={{ fontSize: 24, color: "var(--forest)" }}>{member.points}</div>
          </div>
          <div className="ev-card" style={{ padding: 14, background: "var(--cream)" }}>
            <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 700, marginBottom: 4 }}>{t.member_spent}</div>
            <div className="ev-display" style={{ fontSize: 24, color: "var(--forest)" }}><Money v={member.spent} /></div>
          </div>
        </div>

        {next && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4, opacity: 0.7 }}>
              <span>{t.to_next_tier} {t[`tier_${next.tier}`]}</span>
              <span>฿{next.remaining.toFixed(0)}</span>
            </div>
            <div style={{ background: "var(--line)", height: 8, borderRadius: 4 }}>
              <div style={{
                width: `${Math.min(100, (member.spent / (member.spent + next.remaining)) * 100)}%`,
                background: "var(--gold)", height: 8, borderRadius: 4,
              }} />
            </div>
          </div>
        )}

        <div style={{ fontSize: 11.5, opacity: 0.6, borderTop: "1px solid var(--line)", paddingTop: 10 }}>
          {t.earn_info}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN APP
   ============================================================ */
function AdminApp({ lang, menu, setMenu, promotions, setPromotions, orders, setOrders, members, updateOrderStatus }) {
  const t = T[lang];
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("dashboard");

  if (!authed) return <AdminLogin t={t} onLogin={() => setAuthed(true)} />;

  const navItems = [
    ["dashboard", t.nav_dashboard, "📊"], ["orders", t.nav_orders, "🧾"], ["kitchen", t.nav_kitchen, "☕"],
    ["menu", t.nav_menu_mgmt, "📋"], ["promo", t.nav_promo, "🏷️"], ["members", t.nav_members, "👤"],
    ["reports", t.nav_reports, "📈"],
  ];

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div className="ev-nav-side" style={{ display: "flex", flexDirection: "column" }}>
        <div className="ev-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{t.brand}</div>
        <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 20 }}>{t.welcome_admin}</div>
        <div style={{ flex: 1 }}>
          {navItems.map(([key, label, icon]) => (
            <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{icon} &nbsp;{label}</button>
          ))}
        </div>
        <button onClick={() => setAuthed(false)} style={{ color: "rgba(246,241,230,0.6)" }}>↩ {t.logout}</button>
      </div>
      <div className="ev-scroll" style={{ flex: 1, padding: 22 }}>
        {tab === "dashboard" && <DashboardTab t={t} lang={lang} orders={orders} menu={menu} />}
        {tab === "orders" && <OrdersTab t={t} lang={lang} orders={orders} updateOrderStatus={updateOrderStatus} />}
        {tab === "kitchen" && <KitchenTab t={t} lang={lang} orders={orders} updateOrderStatus={updateOrderStatus} />}
        {tab === "menu" && <MenuMgmtTab t={t} lang={lang} menu={menu} setMenu={setMenu} />}
        {tab === "promo" && <PromoTab t={t} lang={lang} promotions={promotions} setPromotions={setPromotions} />}
        {tab === "members" && <MembersTab t={t} lang={lang} members={members} />}
        {tab === "reports" && <ReportsTab t={t} lang={lang} orders={orders} />}
      </div>
    </div>
  );
}

function AdminLogin({ t, onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  function submit() {
    if (email.trim() === ADMIN_EMAIL && pass === ADMIN_PASS) { setErr(""); onLogin(); }
    else setErr(t.login_error);
  }
  function handleKeyDown(e) {
    if (e.key === "Enter") submit();
  }
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 20 }}>
      <div className="ev-card" style={{ padding: 28, width: "100%", maxWidth: 320 }}>
        <div className="ev-display" style={{ fontSize: 22, textAlign: "center", marginBottom: 4, color: "var(--forest)" }}>{t.brand}</div>
        <div style={{ textAlign: "center", fontSize: 13, opacity: 0.6, marginBottom: 20 }}>{t.admin_login_title}</div>
        <label className="ev-label">{t.email}</label>
        <input className="ev-input" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} style={{ marginBottom: 12 }} autoCapitalize="off" autoCorrect="off" />
        <label className="ev-label">{t.password}</label>
        <input className="ev-input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={handleKeyDown} style={{ marginBottom: 12 }} />
        {err && <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 10 }}>{err}</div>}
        <button className="ev-btn ev-btn-primary" style={{ width: "100%" }} onClick={submit}>{t.login}</button>
      </div>
    </div>
  );
}

function statsFor(orders) {
  const today = new Date().toDateString();
  const todays = orders.filter((o) => new Date(o.createdAt).toDateString() === today && o.status !== "cancelled");
  const sales = todays.reduce((s, o) => s + o.grandTotal, 0);
  const itemCounts = {};
  todays.forEach((o) => o.items.forEach((it) => { itemCounts[it.nameEn] = (itemCounts[it.nameEn] || 0) + it.qty; }));
  const top = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0];
  const custSet = new Set(todays.map((o) => o.phone));
  return { sales, count: todays.length, top: top ? top[0] : "-", customers: custSet.size };
}

function DashboardTab({ t, lang, orders, menu }) {
  const s = statsFor(orders);
  const cards = [
    [t.dash_today_sales, `฿${s.sales.toFixed(0)}`], [t.dash_today_orders, s.count],
    [t.dash_top_item, s.top], [t.dash_new_cust, s.customers],
  ];
  const catSales = {};
  orders.filter((o) => o.status !== "cancelled").forEach((o) => o.items.forEach((it) => {
    const m = menu.find((mi) => mi.id === it.itemId);
    const cat = m ? m.cat : "other";
    catSales[cat] = (catSales[cat] || 0) + it.lineTotal;
  }));
  const maxCat = Math.max(1, ...Object.values(catSales));

  return (
    <div>
      <SectionTitle icon="📊">{t.nav_dashboard}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 26 }}>
        {cards.map(([label, val]) => (
          <div key={label} className="ev-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 700, marginBottom: 6 }}>{label}</div>
            <div className="ev-display" style={{ fontSize: 22, fontWeight: 700, color: "var(--forest)" }}>{val}</div>
          </div>
        ))}
      </div>
      <SectionTitle>{t.reports_by_cat}</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CATS.map((c) => (
          <div key={c}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span>{t[`cat_${c}`]}</span><span>฿{(catSales[c] || 0).toFixed(0)}</span>
            </div>
            <div style={{ background: "var(--line)", height: 8, borderRadius: 4 }}>
              <div style={{ width: `${((catSales[c] || 0) / maxCat) * 100}%`, background: "var(--terracotta)", height: 8, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersTab({ t, lang, orders, updateOrderStatus }) {
  const sorted = [...orders].sort((a, b) => b.createdAt - a.createdAt);
  return (
    <div>
      <SectionTitle icon="🧾">{t.order_mgmt_title}</SectionTitle>
      <div style={{ overflowX: "auto" }}>
        <table className="ev-table">
          <thead><tr>
            <th>{t.col_order}</th><th>{t.col_time}</th><th>{t.col_customer}</th><th>{t.col_items}</th>
            <th>{t.col_total}</th><th>{t.col_status}</th><th>{t.col_action}</th>
          </tr></thead>
          <tbody>
            {sorted.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 700 }}>{o.id}</td>
                <td>{new Date(o.createdAt).toLocaleTimeString(lang === "th" ? "th-TH" : "en-US", { hour: "2-digit", minute: "2-digit" })}</td>
                <td>{o.name}</td>
                <td>{o.items.length} {t.items}</td>
                <td><Money v={o.grandTotal} /></td>
                <td><StatusBadge status={o.status} lang={lang} /></td>
                <td>
                  <select className="ev-input" style={{ padding: "5px 8px", fontSize: 12 }} value={o.status}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                    {[...STATUS_FLOW, "cancelled"].map((s) => <option key={s} value={s}>{t[`status_${s}`]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KitchenTab({ t, lang, orders, updateOrderStatus }) {
  const active = orders.filter((o) => o.status === "received" || o.status === "preparing")
    .sort((a, b) => a.createdAt - b.createdAt);
  return (
    <div>
      <SectionTitle icon="☕">{t.kitchen_title}</SectionTitle>
      {active.length === 0 && <div style={{ opacity: 0.5, padding: 30, textAlign: "center" }}>{t.no_active}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
        {active.map((o) => (
          <div key={o.id} className="ev-card" style={{ padding: 14, borderLeft: `4px solid ${STATUS_COLORS[o.status]}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 800 }}>{o.id}</span>
              <StatusBadge status={o.status} lang={lang} />
            </div>
            {o.items.map((it, i) => (
              <div key={i} style={{ fontSize: 12, marginBottom: 4 }}>
                <b>{it.qty}×</b> {lang === "th" ? it.nameTh : it.nameEn}
                <div style={{ opacity: 0.6, fontSize: 11 }}>
                  {t[it.temp]} · {t.sweet} {it.sweet}% · {t[`ice_${it.ice}`]}
                  {it.addons.length > 0 && ` · +${it.addons.map((a) => ADDONS.find((x) => x.id === a)[lang === "th" ? "th" : "en"]).join(", ")}`}
                </div>
                {it.note && <div style={{ fontSize: 11, fontStyle: "italic", opacity: 0.5 }}>"{it.note}"</div>}
              </div>
            ))}
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              {o.status === "received" && (
                <button className="ev-btn ev-btn-terracotta" style={{ flex: 1, padding: "8px", fontSize: 12 }} onClick={() => updateOrderStatus(o.id, "preparing")}>{t.start}</button>
              )}
              {o.status === "preparing" && (
                <button className="ev-btn ev-btn-primary" style={{ flex: 1, padding: "8px", fontSize: 12 }} onClick={() => updateOrderStatus(o.id, "ready")}>{t.done}</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuMgmtTab({ t, lang, menu, setMenu }) {
  const [editing, setEditing] = useState(null); // item or "new"
  function saveItem(item) {
    if (item.id && menu.find((m) => m.id === item.id)) {
      setMenu(menu.map((m) => (m.id === item.id ? item : m)));
    } else {
      const id = "n" + Date.now();
      setMenu([...menu, { ...item, id }]);
    }
    setEditing(null);
  }
  function removeItem(id) {
    if (window.confirm(t.confirm_delete)) setMenu(menu.filter((m) => m.id !== id));
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionTitle icon="📋">{t.menu_mgmt_title}</SectionTitle>
        <button className="ev-btn ev-btn-primary" style={{ marginBottom: 14 }} onClick={() => setEditing({ cat: "coffee", colors: ["#c9a876", "#2b1810"], available: true })}>{t.add_item}</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="ev-table">
          <thead><tr><th></th><th>{t.item_name_th}</th><th>{t.item_name_en}</th><th>{t.item_cat}</th><th>{t.item_price}</th><th></th><th></th></tr></thead>
          <tbody>
            {menu.map((m) => (
              <tr key={m.id}>
                <td><CupIcon uid={`mgmt-${m.id}`} colors={m.colors} size={28} /></td>
                <td>{m.nameTh}</td><td>{m.nameEn}</td><td>{t[`cat_${m.cat}`]}</td><td>฿{m.price}</td>
                <td>
                  <span className="ev-status-badge" style={{ background: m.available !== false ? "#7C9A8222" : "#B5493A22", color: m.available !== false ? "#1F3A2E" : "#B5493A" }}>
                    {m.available !== false ? t.available : t.unavailable}
                  </span>
                </td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button className="ev-btn ev-btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditing(m)}>{t.edit}</button>
                  <button className="ev-btn ev-btn-ghost" style={{ fontSize: 12, color: "var(--danger)" }} onClick={() => removeItem(m.id)}>{t.delete}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <MenuItemModal t={t} item={editing} onClose={() => setEditing(null)} onSave={saveItem} />}
    </div>
  );
}

function MenuItemModal({ t, item, onClose, onSave }) {
  const [form, setForm] = useState({ nameTh: "", nameEn: "", price: 40, cat: "coffee", hot: false, recommended: false, available: true, colors: ["#c9a876", "#2b1810"], ...item });
  return (
    <div className="ev-modal-backdrop" onClick={onClose}>
      <div className="ev-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <h3 className="ev-display" style={{ marginTop: 0 }}>{item.id ? t.edit : t.add_item}</h3>
        <label className="ev-label">{t.item_name_th}</label>
        <input className="ev-input" value={form.nameTh} onChange={(e) => setForm({ ...form, nameTh: e.target.value })} style={{ marginBottom: 10 }} />
        <label className="ev-label">{t.item_name_en}</label>
        <input className="ev-input" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} style={{ marginBottom: 10 }} />
        <label className="ev-label">{t.item_cat}</label>
        <select className="ev-input" value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value, colors: CAT_COLORS[e.target.value] })} style={{ marginBottom: 10 }}>
          {CATS.map((c) => <option key={c} value={c}>{t[`cat_${c}`]}</option>)}
        </select>
        <label className="ev-label">{t.item_price}</label>
        <input className="ev-input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} style={{ marginBottom: 10 }} />
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 8 }}>
          <input type="checkbox" checked={form.available !== false} onChange={(e) => setForm({ ...form, available: e.target.checked })} /> {t.available}
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 16 }}>
          <input type="checkbox" checked={!!form.recommended} onChange={(e) => setForm({ ...form, recommended: e.target.checked })} /> {t.bestseller}
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ev-btn ev-btn-outline" style={{ flex: 1 }} onClick={onClose}>{t.cancel}</button>
          <button className="ev-btn ev-btn-primary" style={{ flex: 1 }} onClick={() => onSave(form)}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

function PromoTab({ t, lang, promotions, setPromotions }) {
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);

  function openAdd() {
    setIsNew(true);
    setEditing({ code: "", name_th: "", name_en: "", type: "percent", value: 10 });
  }
  function openEdit(p) {
    setIsNew(false);
    setEditing({ ...p });
  }
  function save(form) {
    if (isNew) {
      const id = "pr" + Date.now() + Math.floor(Math.random() * 1000);
      setPromotions([...promotions, { ...form, id }]);
    } else {
      setPromotions(promotions.map((x) => (x.id === editing.id ? { ...x, ...form, id: x.id } : x)));
    }
    setEditing(null);
  }
  function remove(id) {
    if (!window.confirm(t.confirm_delete)) return;
    setPromotions(promotions.filter((x) => x.id !== id));
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionTitle icon="🏷️">{t.promo_title}</SectionTitle>
        <button className="ev-btn ev-btn-primary" style={{ marginBottom: 14 }} onClick={openAdd}>{t.add_promo}</button>
      </div>
      {promotions.length === 0 ? (
        <div style={{ textAlign: "center", opacity: 0.5, padding: 40, fontSize: 13 }}>-</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
          {promotions.map((p) => (
            <div key={p.id} className="ev-card" style={{ padding: 14 }}>
              <div className="ev-chip" style={{ marginBottom: 8 }}>{p.code}</div>
              <div style={{ fontWeight: 700 }}>{lang === "th" ? p.name_th : p.name_en}</div>
              <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 10 }}>
                {p.type === "percent" ? `${t.percent}: ${p.value}%` : `${t.fixed}: ฿${p.value}`}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="ev-btn ev-btn-ghost" style={{ fontSize: 12 }} onClick={() => openEdit(p)}>{t.edit}</button>
                <button className="ev-btn ev-btn-ghost" style={{ fontSize: 12, color: "var(--danger)" }} onClick={() => remove(p.id)}>{t.delete}</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && <PromoModal t={t} promo={editing} isNew={isNew} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function PromoModal({ t, promo, isNew, onClose, onSave }) {
  const [form, setForm] = useState({ code: "", name_th: "", name_en: "", type: "percent", value: 10, ...promo });
  const canSave = form.code.trim() && form.name_th.trim() && form.name_en.trim() && form.value > 0;
  return (
    <div className="ev-modal-backdrop" onClick={onClose}>
      <div className="ev-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 360 }}>
        <h3 className="ev-display" style={{ marginTop: 0 }}>{isNew ? t.add_promo : t.edit_promo}</h3>
        <label className="ev-label">{t.promo_code}</label>
        <input className="ev-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} style={{ marginBottom: 10 }} />
        <label className="ev-label">{t.promo_name} (TH)</label>
        <input className="ev-input" value={form.name_th} onChange={(e) => setForm({ ...form, name_th: e.target.value })} style={{ marginBottom: 10 }} />
        <label className="ev-label">{t.promo_name} (EN)</label>
        <input className="ev-input" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} style={{ marginBottom: 10 }} />
        <label className="ev-label">{t.promo_type}</label>
        <select className="ev-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ marginBottom: 10 }}>
          <option value="percent">{t.percent}</option>
          <option value="fixed">{t.fixed}</option>
        </select>
        <label className="ev-label">{t.promo_value}</label>
        <input className="ev-input" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} style={{ marginBottom: 16 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ev-btn ev-btn-outline" style={{ flex: 1 }} onClick={onClose}>{t.cancel}</button>
          <button className="ev-btn ev-btn-primary" style={{ flex: 1 }} disabled={!canSave} onClick={() => onSave(form)}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

function MembersTab({ t, lang, members }) {
  const sorted = [...members].sort((a, b) => b.spent - a.spent);
  return (
    <div>
      <SectionTitle icon="👤">{t.members_title}</SectionTitle>
      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", opacity: 0.5, padding: 40, fontSize: 13 }}>{t.no_members}</div>
      ) : (
        <div className="ev-card" style={{ padding: 4, overflowX: "auto" }}>
          <table className="ev-table">
            <thead>
              <tr>
                <th>{t.col_name}</th><th>{t.col_phone}</th><th>{t.col_tier}</th>
                <th>{t.col_points}</th><th>{t.col_spent}</th><th>{t.col_orders}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m) => (
                <tr key={m.phone}>
                  <td>{m.name || "-"}</td>
                  <td>{m.phone}</td>
                  <td><TierBadge tier={tierOf(m.spent)} t={t} /></td>
                  <td>{m.points}</td>
                  <td><Money v={m.spent} /></td>
                  <td>{m.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReportsTab({ t, lang, orders }) {
  const valid = orders.filter((o) => o.status !== "cancelled");
  const totalSales = valid.reduce((s, o) => s + o.grandTotal, 0);
  const avg = valid.length ? totalSales / valid.length : 0;
  const itemCounts = {};
  valid.forEach((o) => o.items.forEach((it) => {
    const key = lang === "th" ? it.nameTh : it.nameEn;
    itemCounts[key] = (itemCounts[key] || 0) + it.qty;
  }));
  const top5 = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxTop = Math.max(1, ...top5.map(([, v]) => v));

  return (
    <div>
      <SectionTitle icon="📈">{t.reports_title}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 26 }}>
        <div className="ev-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 700, marginBottom: 6 }}>{t.reports_sales}</div>
          <div className="ev-display" style={{ fontSize: 22, color: "var(--forest)" }}>฿{totalSales.toFixed(0)}</div>
        </div>
        <div className="ev-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 700, marginBottom: 6 }}>{t.reports_orders}</div>
          <div className="ev-display" style={{ fontSize: 22, color: "var(--forest)" }}>{valid.length}</div>
        </div>
        <div className="ev-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 700, marginBottom: 6 }}>{t.reports_avg}</div>
          <div className="ev-display" style={{ fontSize: 22, color: "var(--forest)" }}>฿{avg.toFixed(0)}</div>
        </div>
      </div>
      <SectionTitle>{t.reports_top}</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {top5.length === 0 && <div style={{ opacity: 0.5, fontSize: 13 }}>-</div>}
        {top5.map(([name, qty]) => (
          <div key={name}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span>{name}</span><span>{qty}</span>
            </div>
            <div style={{ background: "var(--line)", height: 8, borderRadius: 4 }}>
              <div style={{ width: `${(qty / maxTop) * 100}%`, background: "var(--sage)", height: 8, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   ROOT
   ============================================================ */
export default function EvefeeApp() {
  const [lang, setLang] = useState("th");
  const [view, setView] = useState("customer");
  const [loading, setLoading] = useState(true);
  const [menu, setMenuState] = useState(DEFAULT_MENU);
  const [promotions, setPromotionsState] = useState(DEFAULT_PROMOTIONS);
  const [orders, setOrdersState] = useState([]);
  const [members, setMembersState] = useState([]);

  useEffect(() => {
    (async () => {
      const [m, p, o, mem] = await Promise.all([
        loadOrSeed("evefee:menu", DEFAULT_MENU),
        loadOrSeed("evefee:promotions", DEFAULT_PROMOTIONS),
        loadOrSeed("evefee:orders", []),
        loadOrSeed("evefee:members", []),
      ]);
      setMenuState(m); setPromotionsState(p); setOrdersState(o); setMembersState(mem);
      setLoading(false);
    })();
  }, []);

  const setMenu = useCallback((next) => { setMenuState(next); saveShared("evefee:menu", next); }, []);
  const setPromotions = useCallback((next) => { setPromotionsState(next); saveShared("evefee:promotions", next); }, []);
  const setOrders = useCallback((next) => { setOrdersState(next); saveShared("evefee:orders", next); }, []);
  const setMembers = useCallback((next) => { setMembersState(next); saveShared("evefee:members", next); }, []);

  const placeOrder = useCallback((cart, info, subtotal) => {
    const id = "A" + String(100 + orders.length + Math.floor(Math.random() * 50)).padStart(3, "0");
    const order = {
      id, createdAt: Date.now(), status: "received",
      items: cart, subtotal, ...info,
      grandTotal: info.grandTotal != null ? info.grandTotal : subtotal,
    };
    const next = [...orders, order];
    setOrders(next);

    // Membership: earn points on the final paid amount, redeem points already chosen at checkout.
    const phone = (info.phone || "").trim();
    if (phone) {
      const redeemed = Math.max(0, info.redeemedPoints || 0);
      const earned = Math.floor(order.grandTotal / EARN_PER_BAHT);
      const existing = members.find((m) => m.phone === phone);
      const nextMembers = existing
        ? members.map((m) => (m.phone === phone ? {
            ...m,
            name: info.name || m.name,
            points: Math.max(0, m.points - redeemed + earned),
            spent: m.spent + order.grandTotal,
            orderCount: m.orderCount + 1,
          } : m))
        : [...members, {
            phone, name: info.name || "",
            points: Math.max(0, earned - redeemed),
            spent: order.grandTotal, orderCount: 1, joinedAt: Date.now(),
          }];
      setMembers(nextMembers);
    }
    return order;
  }, [orders, setOrders, members, setMembers]);

  const updateOrderStatus = useCallback((id, status) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
  }, [orders, setOrders]);

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
        <button className={view === "admin" ? "active" : ""} onClick={() => setView("admin")}>{T[lang].admin_view}</button>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        {view === "customer" ? (
          <CustomerApp lang={lang} menu={menu} promotions={promotions} orders={orders} members={members} setMembers={setMembers} placeOrder={placeOrder} view={view} setView={setView} />
        ) : (
          <AdminApp lang={lang} menu={menu} setMenu={setMenu} promotions={promotions} setPromotions={setPromotions}
            orders={orders} setOrders={setOrders} members={members} updateOrderStatus={updateOrderStatus} />
        )}
      </div>
    </div>
  );
}

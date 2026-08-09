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
    nav_pos: "POS หน้าร้าน",
    nav_menu_mgmt: "จัดการเมนู", nav_promo: "โปรโมชั่น", nav_banner: "แบนเนอร์", nav_reports: "รายงาน", nav_reset: "รีเซ็ตข้อมูลตัวอย่าง",
    pos_title: "ขายหน้าร้าน (POS)", pos_search_ph: "ค้นหาเมนู...", pos_cart_title: "ออเดอร์ปัจจุบัน",
    pos_cart_empty: "ยังไม่มีสินค้าในตะกร้า แตะเมนูด้านซ้ายเพื่อเพิ่ม", pos_customer_title: "ข้อมูลลูกค้า (ไม่บังคับ)",
    pos_customer_hint: "กรอกเบอร์โทรเพื่อสะสม/แลกแต้มให้ลูกค้า", pos_walkin_name: "ลูกค้าหน้าร้าน",
    pos_payment_title: "วิธีชำระเงิน", pos_cash_received: "รับเงินสด (บาท)", pos_change_due: "เงินทอน",
    pos_complete_sale: "ชำระเงิน / ปิดการขาย", pos_new_sale: "เริ่มออเดอร์ใหม่", pos_sale_success: "ขายสำเร็จ!",
    pos_receipt_no: "เลขที่ออเดอร์", pos_clear_cart: "ล้างตะกร้า", pos_cash_insufficient: "รับเงินสดไม่พอ",
    pos_points_earned: "ลูกค้าได้รับแต้มสะสม", pos_no_payment: "ยังไม่ได้เปิดใช้วิธีชำระเงินใดๆ ในตั้งค่า",
    marquee_hint: "แตะเพื่อหยุด/เล่นต่อ",
    banner_section_title: "ข่าวสารและโปรโมชั่นจากร้าน", add_banner: "+ เพิ่มแบนเนอร์", edit_banner: "แก้ไขแบนเนอร์",
    banner_image_label: "รูปภาพแบนเนอร์", banner_title_label: "หัวข้อ", banner_desc_label: "รายละเอียด (ถ้ามี)",
    banner_active: "แสดงผลบนหน้าแรก", no_banners: "ยังไม่มีแบนเนอร์ กด \"เพิ่มแบนเนอร์\" เพื่อเริ่มสร้าง",
    banner_upload_required: "กรุณาอัปโหลดรูปภาพก่อนบันทึก", banner_text_ph: "เช่น โปรโมชั่นซื้อ 1 แถม 1 วันนี้เท่านั้น!",
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
    welcome_staff: "สวัสดี, พนักงานหน้าร้าน",
    reset_confirm: "ต้องการรีเซ็ตข้อมูลเมนู/โปรโมชั่นกลับเป็นค่าเริ่มต้นหรือไม่? (ออเดอร์จะไม่ถูกลบ)",
    all_cat: "ทั้งหมด",
    nav_member: "สมาชิก", member_title: "สมาชิก EVEFEE", member_lookup_ph: "กรอกเบอร์โทรศัพท์เพื่อดูแต้มสะสม",
    member_not_found: "ยังไม่พบข้อมูลสมาชิก สั่งซื้อครั้งแรกเพื่อเริ่มสะสมแต้มได้เลย",
    member_login_title: "เข้าสู่ระบบสมาชิก", member_register_title: "สมัครสมาชิกใหม่",
    full_name_label: "ชื่อ-นามสกุล", phone_label: "เบอร์โทรศัพท์", confirm_password: "ยืนยันรหัสผ่าน",
    switch_to_register: "ยังไม่มีบัญชี? สมัครสมาชิก", switch_to_login: "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ",
    member_login_error: "เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง", member_login_no_account: "ไม่พบบัญชีนี้ กรุณาสมัครสมาชิกก่อน",
    account_exists: "เบอร์นี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบ", password_mismatch: "รหัสผ่านไม่ตรงกัน",
    password_too_short: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", logged_in_as: "เข้าสู่ระบบในชื่อ",
    member_points: "แต้มสะสม", member_spent: "ยอดใช้จ่ายสะสม", member_joined: "สมาชิกตั้งแต่",
    tier_bronze: "Bronze", tier_silver: "Silver", tier_gold: "Gold",
    earn_info: "ทุกๆ ฿10 ที่ใช้จ่าย รับ 1 แต้ม • 1 แต้ม = ส่วนลด ฿0.5",
    to_next_tier: "อีกถึงระดับ", redeem_points_label: "ใช้แต้มสะสมแลกส่วนลด", redeem_points_ph: "จำนวนแต้มที่ใช้",
    redeem_available: "มีแต้มสะสม", points_discount: "ส่วนลดจากแต้ม",
    points_invalid_code: "รหัสแต้มไม่ถูกต้อง (ต้องเป็นจำนวนเท่าของแต้มที่กำหนด)", points_insufficient: "แต้มสะสมไม่พอสำหรับโค้ดนี้",
    qr_settings_title: "ตั้งค่า QR PromptPay", qr_upload_label: "อัปโหลดรูป QR PromptPay",
    qr_current: "QR ปัจจุบัน", qr_remove: "ลบรูป QR", qr_none_admin: "ยังไม่ได้อัปโหลดรูป QR",
    qr_missing_customer: "ร้านค้ายังไม่ได้อัปโหลด QR PromptPay กรุณาเลือกวิธีชำระเงินอื่น",
    qr_pay_via: "ชำระผ่านธนาคาร", qr_save_image: "บันทึกรูป QR", qr_open_bank_app: "เปิดแอปธนาคาร",
    qr_open_app_hint: "หากไม่มีแอปนี้ในเครื่อง ระบบจะพาไปหน้าดาวน์โหลด",
    nav_settings: "ตั้งค่า", nav_members: "สมาชิก",
    members_title: "จัดการสมาชิก", col_name: "ชื่อ", col_phone: "เบอร์โทร", col_tier: "ระดับ",
    col_points: "แต้ม", col_spent: "ยอดใช้จ่าย", col_orders: "จำนวนออเดอร์", no_members: "ยังไม่มีข้อมูลสมาชิก",
    settings_title: "ตั้งค่าการชำระเงิน & การรับสินค้า",
    payment_methods: "วิธีการชำระเงินที่เปิดใช้งาน", enable: "เปิดใช้งาน",
    bank_info: "ข้อมูลบัญชีสำหรับโอนเงิน", bank_name: "ชื่อธนาคาร", account_no: "เลขบัญชี", account_name: "ชื่อบัญชี",
    fulfillment_settings: "ช่องทางการรับสินค้า", enable_pickup: "เปิดรับที่ร้าน", enable_delivery: "เปิดจัดส่ง",
    delivery_fee: "ค่าจัดส่ง (บาท)", delivery_providers: "ผู้ให้บริการจัดส่ง", add_provider: "+ เพิ่มผู้ให้บริการ",
    loyalty_settings: "ระบบสะสมแต้ม", loyalty_enabled: "เปิดใช้งานระบบสะสมแต้ม",
    loyalty_earn_rate: "อัตราการสะสมแต้ม", loyalty_earn_rate_suffix: "= 1 แต้ม",
    loyalty_redeem_rate: "อัตราการแลกแต้ม", loyalty_points_word: "แต้ม",
    provider_name_th: "ชื่อ (ไทย)", provider_name_en: "ชื่อ (อังกฤษ)", remove: "ลบ",
    temp_options: "ตัวเลือกอุณหภูมิที่มี", sweet_adjustable: "ปรับระดับความหวานได้", ice_adjustable: "ปรับระดับน้ำแข็งได้",
    available_addons: "ตัวเลือกเพิ่มเติมที่มี",
    member_required_title: "ยืนยันสมาชิกก่อนสั่งซื้อ", member_required_desc: "ลูกค้าต้องเป็นสมาชิกก่อนจึงจะสั่งซื้อและชำระเงินได้",
    check_member: "ตรวจสอบเบอร์", not_member_yet: "ยังไม่พบสมาชิกเบอร์นี้ กรุณาสมัครสมาชิกก่อนสั่งซื้อ",
    register_name_ph: "ชื่อสำหรับสมัครสมาชิก", register_now: "สมัครสมาชิก", welcome_back: "ยินดีต้อนรับกลับ",
    points_pending: "แต้มจะเข้าระบบเมื่อร้านกดเสร็จสิ้นออเดอร์นี้", no_payment_methods: "ร้านยังไม่เปิดวิธีชำระเงินใด กรุณาติดต่อร้าน",
    delivery_fee_label: "ค่าจัดส่ง",
    slip_upload_label: "แนบสลิปการชำระเงิน (PromptPay)", slip_required: "กรุณาแนบสลิปการชำระเงินก่อนยืนยันสั่งซื้อ",
    slip_preview: "สลิปที่แนบ", slip_change: "เปลี่ยนสลิป", view_slip: "ดูสลิป",
    verify_slip: "ตรวจสอบสลิปแล้ว — เริ่มทำได้", slip_verified: "ตรวจสอบสลิปแล้ว", slip_pending_admin: "รอตรวจสอบสลิป",
    slip_not_attached: "ไม่มีสลิปแนบมา", slip_file_error: "กรุณาเลือกไฟล์รูปภาพ",
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
    nav_pos: "POS / Register",
    nav_menu_mgmt: "Menu", nav_promo: "Promotions", nav_banner: "Banners", nav_reports: "Reports", nav_reset: "Reset Sample Data",
    pos_title: "Point of Sale (POS)", pos_search_ph: "Search menu...", pos_cart_title: "Current Order",
    pos_cart_empty: "No items yet. Tap a menu item on the left to add it.", pos_customer_title: "Customer (optional)",
    pos_customer_hint: "Add a phone number to earn/redeem loyalty points for this customer.", pos_walkin_name: "Walk-in Customer",
    pos_payment_title: "Payment Method", pos_cash_received: "Cash Received", pos_change_due: "Change Due",
    pos_complete_sale: "Charge / Complete Sale", pos_new_sale: "Start New Order", pos_sale_success: "Sale Complete!",
    pos_receipt_no: "Order No.", pos_clear_cart: "Clear Cart", pos_cash_insufficient: "Cash received is not enough",
    pos_points_earned: "Points earned by customer", pos_no_payment: "No payment methods are enabled in Settings",
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
    welcome_staff: "Hello, Counter Staff",
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
    temp_options: "Available Temperature Options", sweet_adjustable: "Sweetness Adjustable", ice_adjustable: "Ice Level Adjustable",
    available_addons: "Available Add-ons",
    member_required_title: "Verify Membership Before Ordering", member_required_desc: "Customers must be a registered member to place and pay for an order.",
    check_member: "Check Number", not_member_yet: "No membership found for this number. Please register before ordering.",
    register_name_ph: "Name for registration", register_now: "Register", welcome_back: "Welcome back",
    points_pending: "Points will be credited once the store marks this order completed", no_payment_methods: "The store hasn't enabled any payment method. Please contact the store.",
    delivery_fee_label: "Delivery Fee",
    slip_upload_label: "Attach Payment Slip (PromptPay)", slip_required: "Please attach a payment slip before placing the order",
    slip_preview: "Attached Slip", slip_change: "Change Slip", view_slip: "View Slip",
    verify_slip: "Slip Verified — Ready to Start", slip_verified: "Slip Verified", slip_pending_admin: "Awaiting Slip Verification",
    slip_not_attached: "No slip attached", slip_file_error: "Please select an image file",
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
  { id: "c1", cat: "coffee", nameTh: "อเมริกาโน่มะพร้าว", nameEn: "Coconut Americano", price: 40, colors: ["#c9a876", "#2b1810"], temps: ["hot", "iced"], sweetAdjust: true, iceAdjust: true, addonIds: ALL_ADDON_IDS, recommended: false, available: true },
  { id: "c2", cat: "coffee", nameTh: "อเมริกาโน่น้ำผึ้งมะนาว", nameEn: "Honey Lemon Americano", price: 40, colors: ["#f3c94a", "#e08a1f"], temps: ["iced"], sweetAdjust: true, iceAdjust: true, addonIds: ALL_ADDON_IDS, recommended: false, available: true },
  { id: "c3", cat: "coffee", nameTh: "ยูสุโคลบลู", nameEn: "Yuzu Cold Blue", price: 90, colors: ["#e0c68a", "#2b1810"], temps: ["iced"], sweetAdjust: true, iceAdjust: true, addonIds: ALL_ADDON_IDS, recommended: false, available: true },
  { id: "c4", cat: "coffee", nameTh: "โคโค่นัทลาเต้", nameEn: "Coconut Latte", price: 60, colors: ["#e8dcc4", "#8a5a34"], temps: ["hot", "iced", "frappe"], sweetAdjust: true, iceAdjust: true, addonIds: ALL_ADDON_IDS, recommended: false, available: true },
  { id: "c5", cat: "coffee", nameTh: "โคโค่นัทมัทฉะโฟม", nameEn: "Coconut Matcha Cold Foam", price: 95, colors: ["#e8dcc4", "#5c8a3a"], temps: ["iced"], sweetAdjust: true, iceAdjust: true, addonIds: ALL_ADDON_IDS, recommended: false, available: true },
  { id: "m1", cat: "matcha", nameTh: "โคโค่นัทเผือก", nameEn: "Coconut Taro", price: 60, colors: ["#e6d6ec", "#9b7fc9"], temps: ["iced"], sweetAdjust: true, iceAdjust: true, addonIds: ALL_ADDON_IDS, recommended: false, available: true },
  { id: "m2", cat: "matcha", nameTh: "เพียวมัทฉะน้ำมะพร้าว", nameEn: "Pure Matcha Coconut", price: 80, colors: ["#d8ecc0", "#5c8a3a"], temps: ["iced"], sweetAdjust: true, iceAdjust: true, addonIds: ALL_ADDON_IDS, recommended: false, available: true },
  { id: "m3", cat: "matcha", nameTh: "เพียวมัทฉะน้ำผึ้งมะนาว", nameEn: "Pure Matcha Honey Lemon", price: 80, colors: ["#f3d94a", "#4c7a34"], temps: ["iced"], sweetAdjust: true, iceAdjust: true, addonIds: ALL_ADDON_IDS, recommended: false, available: true },
  { id: "m4", cat: "matcha", nameTh: "มัทฉะลาเต้เผือก", nameEn: "Matcha Taro Latte", price: 120, colors: ["#c9a8e0", "#5c8a3a"], temps: ["iced", "frappe"], sweetAdjust: true, iceAdjust: true, addonIds: ALL_ADDON_IDS, recommended: true, available: true },
  { id: "m5", cat: "matcha", nameTh: "มัทฉะสตรอเบอร์รี่", nameEn: "Matcha Strawberry", price: 95, colors: ["#f0a8c0", "#4c7a34"], temps: ["iced", "frappe"], sweetAdjust: true, iceAdjust: true, addonIds: ALL_ADDON_IDS, recommended: true, available: true },
  { id: "te1", cat: "tea", nameTh: "ชาไทยน้ำส้ม", nameEn: "Thai Tea Orange Juice", price: 40, colors: ["#f0803c", "#c1461f"], temps: ["iced"], sweetAdjust: true, iceAdjust: true, addonIds: [], recommended: false, available: true },
  { id: "te2", cat: "tea", nameTh: "น้ำผึ้งมะนาวโซดา", nameEn: "Honey Lemon Soda", price: 30, colors: ["#f3e8a0", "#e0c060"], temps: ["iced"], sweetAdjust: true, iceAdjust: true, addonIds: [], recommended: false, available: true },
  { id: "te3", cat: "tea", nameTh: "ชาไทยซิกเนเจอร์", nameEn: "Signature Thai Tea", price: 40, colors: ["#f0a03c", "#c1461f"], temps: ["hot", "iced"], sweetAdjust: true, iceAdjust: true, addonIds: [], recommended: true, available: true },
  { id: "sp1", cat: "special", nameTh: "สตรอเบอร์รี่โกโก้", nameEn: "Strawberry Cocoa", price: 45, colors: ["#e89ca8", "#3c2415"], temps: ["iced"], sweetAdjust: false, iceAdjust: true, addonIds: ["honey"], recommended: false, available: true },
  { id: "sp2", cat: "special", nameTh: "สตรอเบอร์รี่ชีสเค้ก", nameEn: "Strawberry Cheesecake", price: 50, colors: ["#f0e8d0", "#c17a4f"], temps: ["iced"], sweetAdjust: false, iceAdjust: true, addonIds: ["honey"], recommended: false, available: true },
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
  // Loyalty points, configurable by the admin (see LoyaltyTab). Defaults match the
  // brief: spend 20 baht -> 1 point; redeem 100 points -> ฿50 off, via coupon code
  // "POINT100" (or "POINT" + any multiple of redeemPoints, e.g. POINT200 for ฿100 off).
  loyalty: { enabled: true, earnPerBaht: 20, redeemPoints: 100, redeemValue: 50 },
};
// Two access tiers share this login screen:
// - STAFF: counter/POS staff — can sell, manage orders, and run the kitchen
//   screen, but cannot reach Settings, Menu, Promotions, Banners, Members, or Reports.
// - MANAGER: full back-office access to every tab, including Settings.
const STAFF_EMAIL = "Posevefee@evefee.com";
const STAFF_PASS = "posevefee";
const MANAGER_EMAIL = "manager@evefee.com";
const MANAGER_PASS = "adminmanager";
const STAFF_TABS = ["pos", "orders", "kitchen"];
const STATUS_FLOW = ["received", "preparing", "ready", "completed"];
const STATUS_COLORS = {
  received: "#D4A24C", preparing: "#C17A4F", ready: "#7C9A82",
  delivering: "#7C9A82", completed: "#1F3A2E", cancelled: "#B5493A",
};

/* ---------------- Membership / loyalty points ---------------- */
// Fallback values only — the live rates always come from settings.loyalty
// (see DEFAULT_SETTINGS above), which the admin can change in the Loyalty tab.
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

/* ---------------- Thai bank app deep links ----------------
   Best-effort: each bank ships its own custom URL scheme for opening
   its mobile app directly. Matching is done against the free-text
   bank name the store owner typed into Settings. If the scheme fails
   to open the app (not installed, scheme changed, desktop browser),
   we fall back to that bank's app-store listing after a short delay. */
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
// Try to hand off to the native banking app; if it isn't installed (the tab
// never loses focus), send the customer to that bank's store listing instead.
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

/* ---------------- Password hashing ----------------
   Member passwords are hashed with SHA-256 (Web Crypto) before ever being
   stored, so the shared storage backing this prototype never holds a
   plaintext password. This is still just client-side hashing with no
   server-side salt/pepper — fine for a demo, not a substitute for a real
   auth backend in production. */
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
  // Signed-in member's phone, kept in memory only — like the rest of this
  // prototype there's no browser storage, so signing out on refresh is expected.
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
          <HomePage t={t} lang={lang} recommended={recommended} promotions={promotions} banners={banners} setPage={setPage} setActiveCat={setActiveCat} setDetailItem={setDetailItem} onUnlockStaff={onUnlockStaff} />
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

function HomePage({ t, lang, recommended, promotions, banners, setPage, setActiveCat, setDetailItem, onUnlockStaff }) {
  // Tapping the brand logo 5x in a row (within ~1.2s of each other) quietly reveals
  // the "ร้านค้า" switch for staff — no visible feedback of the *unlock* itself, so it
  // stays invisible to ordinary customers browsing the home page. Each individual tap
  // does get a tiny scale "pulse" (0.18s) purely as a tactile confirmation that the tap
  // landed on the logo — it looks like a normal tap micro-interaction, not a counter.
  const tapState = React.useRef({ count: 0, timer: null });
  const [logoPulse, setLogoPulse] = useState(0);
  // Promotions marquee: auto-scrolls left continuously; tapping the strip pauses it
  // (and lets you swipe through manually) — tap again to resume auto-scroll.
  const [promoPaused, setPromoPaused] = useState(false);
  function handleLogoTap() {
    setLogoPulse((k) => k + 1); // restart the pulse animation every tap, registered or not
    if (!onUnlockStaff) return;
    const s = tapState.current;
    s.count += 1;
    if (s.timer) clearTimeout(s.timer);
    if (s.count >= 5) {
      s.count = 0;
      onUnlockStaff();
      return;
    }
    s.timer = setTimeout(() => { s.count = 0; }, 1200);
  }

  return (
    <div>
      <div className="ev-card" style={{ padding: 22, marginBottom: 22, background: "linear-gradient(135deg,#EFE7D3,var(--cream-soft))" }}>
        <div className="ev-eyebrow">🌿 {t.tagline}</div>
        <h1
          key={logoPulse}
          className={`ev-display ev-logo-tap${logoPulse ? " pulse" : ""}`}
          style={{ fontSize: 26, margin: "8px 0 6px", padding: "6px 4px", marginLeft: -4, color: "var(--forest)", cursor: "default", userSelect: "none", WebkitUserSelect: "none" }}
          onClick={handleLogoTap}
        >
          {t.brand}
        </h1>
        <p style={{ fontSize: 13, opacity: 0.75, margin: "0 0 14px", maxWidth: 320 }}>
          {lang === "th" ? "วัตถุดิบสดใหม่ คุณภาพพรีเมียม ส่งตรงถึงมือคุณ" : "Fresh ingredients, premium quality, delivered fresh to you."}
        </p>
        <button className="ev-btn ev-btn-primary" onClick={() => setPage("menu")}>{t.nav_menu} →</button>
      </div>

      {banners && banners.filter((b) => b.active !== false && b.image).length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <BannerCarousel t={t} lang={lang} banners={banners.filter((b) => b.active !== false && b.image)} />
        </div>
      )}

      {promotions && promotions.length > 0 && (
        <>
          <SectionTitle icon="🏷️">{t.promo_title}</SectionTitle>
          <div
            style={{ overflowX: promoPaused ? "auto" : "hidden", marginBottom: 6, cursor: "pointer", WebkitOverflowScrolling: "touch" }}
            onClick={() => setPromoPaused((p) => !p)}
          >
            <div
              className={`ev-marquee-track${promoPaused ? " paused" : ""}`}
              style={{ animationDuration: `${Math.max(10, promotions.length * 3)}s` }}
            >
              {[...promotions, ...promotions].map((p, i) => (
                <div key={`${p.id}-${i}`} style={{
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
          </div>
          <div style={{ fontSize: 10.5, opacity: 0.45, marginBottom: 24, textAlign: "center" }}>{t.marquee_hint}</div>
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

/* Auto-sliding, swipeable news/promotion banner strip for the home page.
   Advances on a timer and also responds to left/right swipe or arrow taps. */
function BannerCarousel({ t, lang, banners }) {
  const [idx, setIdx] = useState(0);
  const count = banners.length;
  const touchX = React.useRef(null);

  useEffect(() => { if (idx >= count) setIdx(0); }, [count, idx]);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % count), 4500);
    return () => clearInterval(id);
  }, [count]);

  function go(delta) { setIdx((i) => (i + delta + count) % count); }
  function onTouchStart(e) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  }

  return (
    <div>
      <div className="ev-section-title">
        <h2>📢 {t.banner_section_title}</h2>
        <div className="rule" />
      </div>
      <div
        className="ev-card"
        style={{ position: "relative", overflow: "hidden", borderRadius: 16 }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          style={{
            display: "flex", transform: `translateX(-${idx * 100}%)`,
            transition: "transform .4s ease",
          }}
        >
          {banners.map((b) => (
            <div key={b.id} style={{ minWidth: "100%" }}>
              <img
                src={b.image}
                alt={lang === "th" ? b.title_th : b.title_en}
                style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
              />
              {((lang === "th" ? b.title_th : b.title_en) || (lang === "th" ? b.desc_th : b.desc_en)) && (
                <div style={{ padding: "12px 14px" }}>
                  {(lang === "th" ? b.title_th : b.title_en) && (
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{lang === "th" ? b.title_th : b.title_en}</div>
                  )}
                  {(lang === "th" ? b.desc_th : b.desc_en) && (
                    <div style={{ fontSize: 12.5, opacity: 0.7 }}>{lang === "th" ? b.desc_th : b.desc_en}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              onClick={() => go(-1)} aria-label="prev"
              style={{
                position: "absolute", left: 8, top: 68, width: 30, height: 30, borderRadius: 999, border: "none",
                background: "rgba(19,41,32,0.55)", color: "#fff", cursor: "pointer", fontSize: 15, lineHeight: 1,
              }}
            >‹</button>
            <button
              onClick={() => go(1)} aria-label="next"
              style={{
                position: "absolute", right: 8, top: 68, width: 30, height: 30, borderRadius: 999, border: "none",
                background: "rgba(19,41,32,0.55)", color: "#fff", cursor: "pointer", fontSize: 15, lineHeight: 1,
              }}
            >›</button>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "10px 0" }}>
              {banners.map((b, i) => (
                <button
                  key={b.id} onClick={() => setIdx(i)} aria-label={`slide ${i + 1}`}
                  style={{
                    width: i === idx ? 16 : 6, height: 6, borderRadius: 999, border: "none", cursor: "pointer",
                    background: i === idx ? "var(--forest)" : "var(--line)", transition: "width .2s ease",
                  }}
                />
              ))}
            </div>
          </>
        )}
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
  const temps = item.temps && item.temps.length ? item.temps : ["iced"];
  const availAddons = ADDONS.filter((a) => (item.addonIds ? item.addonIds.includes(a.id) : true));
  const [temp, setTemp] = useState(temps[0]);
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

        {temps.length > 1 && (
          <>
            <label className="ev-label">{t.temp}</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {temps.map((opt) => (
                <button key={opt} onClick={() => setTemp(opt)} className="ev-btn"
                  style={{ flex: 1, padding: "8px 4px", fontSize: 12.5, background: temp === opt ? "var(--forest)" : "#fff", color: temp === opt ? "#fff" : "var(--cocoa)", border: "1.5px solid var(--line)" }}>
                  {t[opt]}
                </button>
              ))}
            </div>
          </>
        )}

        {item.sweetAdjust !== false && (
          <>
            <label className="ev-label">{t.sweet}</label>
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {[100, 75, 50, 25, 0].map((s) => (
                <button key={s} onClick={() => setSweet(s)} className="ev-btn"
                  style={{ flex: 1, padding: "7px 2px", fontSize: 11.5, background: sweet === s ? "var(--sage)" : "#fff", color: sweet === s ? "#fff" : "var(--cocoa)", border: "1.5px solid var(--line)" }}>
                  {s}%
                </button>
              ))}
            </div>
          </>
        )}

        {item.iceAdjust !== false && (
          <>
            <label className="ev-label">{t.ice}</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["normal", "less", "none"].map((opt) => (
                <button key={opt} onClick={() => setIce(opt)} className="ev-btn"
                  style={{ flex: 1, padding: "8px 4px", fontSize: 12.5, background: ice === opt ? "var(--gold)" : "#fff", color: ice === opt ? "#fff" : "var(--cocoa)", border: "1.5px solid var(--line)" }}>
                  {t[`ice_${opt}`]}
                </button>
              ))}
            </div>
          </>
        )}

        {availAddons.length > 0 && (
          <>
            <label className="ev-label">{t.addons}</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
              {availAddons.map((a) => (
                <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={selAddons.includes(a.id)} onChange={() => toggleAddon(a.id)} />
                  <span style={{ flex: 1 }}>{lang === "th" ? a.th : a.en}</span>
                  <span style={{ fontWeight: 700, color: "var(--terracotta-deep)" }}>+฿{a.price}</span>
                </label>
              ))}
            </div>
          </>
        )}

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

function CheckoutPage({ t, lang, cart, total, promotions, members, qrImage, settings, registerMember, onPlace }) {
  const enabledPayments = ["qr", "transfer", "card", "cash"].filter((p) => settings.payments && settings.payments[p]);
  const pickupOn = settings.fulfillment ? settings.fulfillment.pickup !== false : true;
  const deliveryOn = settings.fulfillment ? settings.fulfillment.delivery !== false : true;
  const providers = settings.deliveryProviders && settings.deliveryProviders.length ? settings.deliveryProviders : DEFAULT_SETTINGS.deliveryProviders;
  const deliveryFeeAmt = settings.fulfillment ? Number(settings.fulfillment.deliveryFee) || 0 : 0;
  const loyalty = getLoyaltyConfig(settings);

  const [phone, setPhone] = useState("");
  const [regName, setRegName] = useState("");
  const [fulfil, setFulfil] = useState(pickupOn ? "pickup" : "delivery");
  const [deliveryProvider, setDeliveryProvider] = useState(providers[0] ? providers[0].id : "grab");
  const [when, setWhen] = useState("now");
  const [payment, setPayment] = useState(enabledPayments[0] || "");
  const [address, setAddress] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [redeemInput, setRedeemInput] = useState(0);
  const [slipImage, setSlipImage] = useState("");
  const [slipError, setSlipError] = useState("");

  const member = members && phone.trim() ? members[phone.trim()] : null;

  function handleSlipFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setSlipError(t.slip_file_error); return; }
    const reader = new FileReader();
    reader.onload = () => { setSlipError(""); setSlipImage(reader.result); };
    reader.onerror = () => setSlipError(t.slip_file_error);
    reader.readAsDataURL(file);
  }

  function applyCoupon() {
    const raw = couponInput.trim();
    const pointMatch = raw.match(/^point\s*(\d+)$/i);
    if (pointMatch) {
      const wantPoints = parseInt(pointMatch[1], 10);
      if (!loyalty.enabled) { setCouponMsg(t.coupon_invalid); return; }
      if (wantPoints <= 0 || wantPoints % loyalty.redeemPoints !== 0) { setCouponMsg(t.points_invalid_code); return; }
      if (!member) { setCouponMsg(t.member_login_no_account); return; }
      if (wantPoints > member.points) { setCouponMsg(t.points_insufficient); return; }
      setCoupon(null);
      setRedeemInput(wantPoints);
      setCouponMsg(t.coupon_applied);
      return;
    }
    const found = promotions.find((p) => p.code.toLowerCase() === raw.toLowerCase());
    if (!found) { setCouponMsg(t.coupon_invalid); setCoupon(null); return; }
    setCoupon(found); setCouponMsg(t.coupon_applied);
  }
  const discount = coupon ? (coupon.type === "percent" ? Math.round(total * (coupon.value / 100)) : coupon.value) : 0;
  const deliveryFee = fulfil === "delivery" ? deliveryFeeAmt : 0;
  const afterCoupon = Math.max(0, total - discount) + deliveryFee;

  const pointValue = loyalty.redeemValue / loyalty.redeemPoints; // baht discount per point
  const availablePoints = member ? member.points : 0;
  const maxRedeemable = Math.min(availablePoints, Math.floor(afterCoupon / pointValue));
  const pointsUsed = Math.max(0, Math.min(Number(redeemInput) || 0, maxRedeemable));
  const pointsDiscount = Math.round(pointsUsed * pointValue);
  const grandTotal = Math.max(0, afterCoupon - pointsDiscount);
  const needsSlip = payment === "qr";
  const canPlace = !!member && !!payment && (fulfil === "pickup" || address.trim()) && (!needsSlip || !!slipImage);

  return (
    <div>
      <SectionTitle icon="✅">{t.checkout_title}</SectionTitle>

      {/* Step 1 — membership gate */}
      <div className="ev-card" style={{ padding: 16, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 16 }}>💳</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{t.member_required_title}</span>
        </div>
        <p style={{ fontSize: 12, opacity: 0.65, marginBottom: 12 }}>{t.member_required_desc}</p>
        <label className="ev-label">{t.phone}</label>
        <input className="ev-input" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ marginBottom: 10 }} />

        {!member && phone.trim() && (
          <div style={{ background: "rgba(181,73,58,0.08)", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 12, color: "var(--danger)", marginBottom: 10 }}>{t.not_member_yet}</div>
            <input className="ev-input" placeholder={t.register_name_ph} value={regName} onChange={(e) => setRegName(e.target.value)} style={{ marginBottom: 10 }} />
            <button className="ev-btn ev-btn-primary" style={{ width: "100%" }} disabled={!regName.trim()}
              onClick={() => registerMember(phone, regName)}>
              {t.register_now}
            </button>
          </div>
        )}
        {member && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(124,154,130,0.15)", borderRadius: 10, padding: "10px 12px" }}>
            <span style={{ fontSize: 13 }}>✅ {t.welcome_back}, <b>{member.name || phone}</b></span>
            <TierBadge tier={tierOf(member.totalSpent)} t={t} />
          </div>
        )}
      </div>

      {member && (
        <>
          {pickupOn && deliveryOn && (
            <>
              <label className="ev-label">{t.fulfil}</label>
              <div className="ev-tabbar" style={{ marginBottom: 16 }}>
                <button className={fulfil === "pickup" ? "active" : ""} onClick={() => setFulfil("pickup")}>{t.pickup}</button>
                <button className={fulfil === "delivery" ? "active" : ""} onClick={() => setFulfil("delivery")}>{t.delivery}</button>
              </div>
            </>
          )}

          {fulfil === "delivery" && deliveryOn && (
            <>
              <label className="ev-label">{t.delivery_provider}</label>
              <div className="ev-tabbar" style={{ marginBottom: 16 }}>
                {providers.map((p) => (
                  <button key={p.id} className={deliveryProvider === p.id ? "active" : ""} onClick={() => setDeliveryProvider(p.id)}>
                    {lang === "th" ? p.th : p.en}
                  </button>
                ))}
              </div>
              {deliveryFeeAmt > 0 && (
                <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 16 }}>{t.delivery_fee_label}: +฿{deliveryFeeAmt}</div>
              )}
            </>
          )}

          <label className="ev-label">{t.when}</label>
          <div className="ev-tabbar" style={{ marginBottom: 16 }}>
            <button className={when === "now" ? "active" : ""} onClick={() => setWhen("now")}>{t.now_order}</button>
            <button className={when === "schedule" ? "active" : ""} onClick={() => setWhen("schedule")}>{t.schedule}</button>
          </div>

          <label className="ev-label">{t.payment}</label>
          {enabledPayments.length === 0 ? (
            <div style={{ fontSize: 12.5, color: "var(--danger)", marginBottom: 16 }}>{t.no_payment_methods}</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              {enabledPayments.map((p) => (
                <button key={p} onClick={() => setPayment(p)} className="ev-btn"
                  style={{ padding: "10px", fontSize: 12.5, background: payment === p ? "var(--forest)" : "#fff", color: payment === p ? "#fff" : "var(--cocoa)", border: "1.5px solid var(--line)" }}>
                  {t[p]}
                </button>
              ))}
            </div>
          )}

          {payment === "qr" && (
            <div className="ev-card" style={{ padding: 16, textAlign: "center", marginBottom: 16 }}>
              {qrImage ? (
                <>
                  <img src={qrImage} alt="QR PromptPay" style={{ width: 180, height: 180, objectFit: "contain", margin: "0 auto", display: "block", borderRadius: 8 }} />
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>{t.qr_current} — {t.brand}</div>

                  {settings.bank && settings.bank.bankName && (
                    <div className="ev-chip" style={{ marginTop: 10 }}>
                      🏦 {t.qr_pay_via}: {settings.bank.bankName}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", justifyContent: "center" }}>
                    <a
                      href={qrImage}
                      download="evefee-promptpay-qr.png"
                      className="ev-btn ev-btn-outline"
                      style={{ fontSize: 12.5, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                    >
                      ⬇ {t.qr_save_image}
                    </a>
                    {getBankApp(settings.bank && settings.bank.bankName) && (
                      <button
                        type="button"
                        className="ev-btn ev-btn-terracotta"
                        style={{ fontSize: 12.5 }}
                        onClick={() => openBankApp(settings.bank.bankName)}
                      >
                        📲 {t.qr_open_bank_app}
                      </button>
                    )}
                  </div>
                  {getBankApp(settings.bank && settings.bank.bankName) && (
                    <div style={{ fontSize: 11, opacity: 0.55, marginTop: 6 }}>{t.qr_open_app_hint}</div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 12.5, opacity: 0.6, padding: "10px 4px" }}>{t.qr_missing_customer}</div>
              )}
            </div>
          )}

          {needsSlip && (
            <div className="ev-card" style={{ padding: 16, marginBottom: 16 }}>
              <label className="ev-label">{t.slip_upload_label} <span style={{ color: "var(--danger)" }}>*</span></label>
              {slipImage ? (
                <div style={{ textAlign: "center" }}>
                  <img src={slipImage} alt="Payment slip" style={{ width: 140, borderRadius: 8, border: "1px solid var(--line)", marginBottom: 8 }} />
                  <div style={{ fontSize: 11.5, color: "var(--forest)", fontWeight: 700, marginBottom: 8 }}>✓ {t.slip_preview}</div>
                  <label className="ev-btn ev-btn-outline" style={{ fontSize: 12, cursor: "pointer", display: "inline-block" }}>
                    {t.slip_change}
                    <input type="file" accept="image/*" onChange={handleSlipFile} style={{ display: "none" }} />
                  </label>
                </div>
              ) : (
                <input type="file" accept="image/*" onChange={handleSlipFile} style={{ fontSize: 13 }} />
              )}
              {slipError && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 8 }}>{slipError}</div>}
              {!slipImage && <div style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 8 }}>{t.slip_required}</div>}
            </div>
          )}

          {payment === "transfer" && settings.bank && settings.bank.accountNo && (
            <div className="ev-card" style={{ padding: 16, marginBottom: 16 }}>
              <div className="ev-eyebrow" style={{ marginBottom: 8 }}>{t.bank_info}</div>
              <div style={{ fontSize: 13, marginBottom: 3 }}>{t.bank_name}: <b>{settings.bank.bankName}</b></div>
              <div style={{ fontSize: 13, marginBottom: 3 }}>{t.account_no}: <b>{settings.bank.accountNo}</b></div>
              <div style={{ fontSize: 13 }}>{t.account_name}: <b>{settings.bank.accountName}</b></div>
            </div>
          )}

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
          {loyalty.enabled && (
            <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 6 }}>
              {lang === "th"
                ? `หรือกรอก POINT${loyalty.redeemPoints} ในช่องด้านบน เพื่อแลก ${loyalty.redeemPoints} แต้ม = ส่วนลด ฿${loyalty.redeemValue}`
                : `Or enter POINT${loyalty.redeemPoints} above to redeem ${loyalty.redeemPoints} points for ฿${loyalty.redeemValue} off`}
            </div>
          )}
          {couponMsg && <div style={{ fontSize: 12, color: coupon ? "var(--forest)" : "var(--danger)", marginBottom: 12 }}>{couponMsg}</div>}

          {loyalty.enabled && (
          <div className="ev-card" style={{ padding: 14, marginBottom: 16, background: "rgba(212,162,76,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="ev-label" style={{ marginBottom: 0 }}>{t.redeem_points_label}</span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>{t.redeem_available}: <b>{availablePoints}</b></div>
            {maxRedeemable > 0 ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input className="ev-input" type="number" min={0} max={maxRedeemable} placeholder={t.redeem_points_ph}
                  value={redeemInput} onChange={(e) => setRedeemInput(e.target.value)} style={{ flex: 1 }} />
                <button className="ev-btn ev-btn-outline" style={{ fontSize: 12 }} onClick={() => setRedeemInput(maxRedeemable)}>
                  {lang === "th" ? "ใช้สูงสุด" : "Max"}
                </button>
              </div>
            ) : (
              <div style={{ fontSize: 12, opacity: 0.5 }}>{lang === "th" ? "ยังไม่มีแต้มที่ใช้ได้" : "No points available to redeem"}</div>
            )}
          </div>
          )}

          <div className="ev-card" style={{ padding: 16, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
              <span>{t.total}</span><span><Money v={total} /></span>
            </div>
            {discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "var(--forest)" }}>
                <span>{t.discount}</span><span>-<Money v={discount} /></span>
              </div>
            )}
            {deliveryFee > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span>{t.delivery_fee_label}</span><span>+<Money v={deliveryFee} /></span>
              </div>
            )}
            {pointsDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "var(--gold)" }}>
                <span>{t.points_discount} ({pointsUsed} pt)</span><span>-<Money v={pointsDiscount} /></span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, marginTop: 6 }}>
              <span>{t.total}</span><span><Money v={grandTotal} /></span>
            </div>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 8 }}>{t.points_pending}</div>
            <button className="ev-btn ev-btn-terracotta" style={{ width: "100%", marginTop: 10 }} disabled={!canPlace}
              onClick={() => onPlace({
                fulfil, deliveryProvider, when, payment, name: member.name, phone: phone.trim(), address,
                coupon: coupon ? coupon.code : null, discount, deliveryFee, pointsRedeemed: pointsUsed, pointsDiscount, grandTotal,
                slipImage: needsSlip ? slipImage : null,
              })}>
              {t.place_order}
            </button>
          </div>
        </>
      )}
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

function HistoryPage({ t, lang, orders, onReorder }) {
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const matched = orders.filter((o) => o.phone === phone).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <SectionTitle icon="📜">{t.history_title}</SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input className="ev-input" placeholder={t.enter_phone} value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button className="ev-btn ev-btn-primary" onClick={() => setSearched(true)}>{t.find}</button>
      </div>
      {searched && matched.length === 0 && <div style={{ textAlign: "center", opacity: 0.6, padding: 30 }}>{t.no_history}</div>}
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

function MemberPage({ t, lang, members, phone, settings, onLogout }) {
  const loyalty = getLoyaltyConfig(settings);
  const member = members ? members[phone] : null;
  const tier = member ? tierOf(member.totalSpent) : null;
  const next = member ? nextTierInfo(member.totalSpent) : null;
  const tierIdx = tier ? TIERS.findIndex((tr) => tr.key === tier) : 0;
  const curMin = tier ? TIERS[tierIdx].min : 0;
  const nextMin = next ? TIERS.find((tr) => tr.key === next.tier).min : curMin;
  const progressPct = member && next ? Math.min(100, Math.round(((member.totalSpent - curMin) / (nextMin - curMin)) * 100)) : 100;

  if (!member) {
    // Shouldn't normally happen (auth only succeeds for a real record), but handle
    // gracefully if the record disappeared from shared storage after login.
    return (
      <div>
        <SectionTitle icon="💳">{t.member_title}</SectionTitle>
        <div className="ev-card" style={{ padding: 24, textAlign: "center" }}>
          <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 14 }}>{t.member_not_found}</p>
          <button className="ev-btn ev-btn-outline" onClick={onLogout}>{t.logout}</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <SectionTitle icon="💳">{t.member_title}</SectionTitle>
        <button className="ev-btn ev-btn-ghost" style={{ fontSize: 12, marginTop: -14 }} onClick={onLogout}>↩ {t.logout}</button>
      </div>

      <div className="ev-card" style={{ padding: 20, background: "linear-gradient(135deg,var(--forest),var(--forest-deep))", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>{member.name || t.brand}</div>
            <div className="ev-display" style={{ fontSize: 22, fontWeight: 700 }}>{phone}</div>
          </div>
          <span className="ev-status-badge" style={{ background: `${TIER_COLORS[tier]}33`, color: "#fff" }}>{t[`tier_${tier}`]}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 4 }}>{t.member_points}</div>
            <div className="ev-display" style={{ fontSize: 22, fontWeight: 700 }}>{member.points}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 4 }}>{t.member_spent}</div>
            <div className="ev-display" style={{ fontSize: 22, fontWeight: 700 }}>฿{member.totalSpent.toFixed(0)}</div>
          </div>
        </div>

        {next && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 5 }}>
              ฿{next.remaining.toFixed(0)} {t.to_next_tier} {t[`tier_${next.tier}`]}
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", height: 7, borderRadius: 4 }}>
              <div style={{ width: `${progressPct}%`, background: "var(--gold)", height: 7, borderRadius: 4 }} />
            </div>
          </div>
        )}
        <div style={{ fontSize: 10, opacity: 0.6, marginTop: 6 }}>
          {t.member_joined}: {new Date(member.joinedAt).toLocaleDateString(lang === "th" ? "th-TH" : "en-US")}
        </div>
      </div>
      <div style={{ fontSize: 11, opacity: 0.5, marginTop: 14, textAlign: "center" }}>
        {lang === "th"
          ? `ทุกๆ ฿${loyalty.earnPerBaht} ที่ใช้จ่าย รับ 1 แต้ม • ${loyalty.redeemPoints} แต้ม = ส่วนลด ฿${loyalty.redeemValue}`
          : `Earn 1 point per ฿${loyalty.earnPerBaht} spent • ${loyalty.redeemPoints} points = ฿${loyalty.redeemValue} discount`}
      </div>
    </div>
  );
}

/* Login / Register gate shown on the "สมาชิก" tab until the customer authenticates.
   Passwords are SHA-256 hashed client-side before ever touching shared storage —
   see sha256Hex() — but this is still a browser-only demo, not real backend auth. */
function MemberAuthPage({ t, lang, members, registerAccount, onAuthed }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function resetFields() { setPassword(""); setConfirm(""); setError(""); }
  function switchMode(next) { setMode(next); resetFields(); }

  async function handleLogin() {
    setError("");
    const key = phone.trim();
    const member = members ? members[key] : null;
    if (!member) { setError(t.member_login_no_account); return; }
    setBusy(true);
    const hash = await sha256Hex(password);
    setBusy(false);
    if (!member.password || member.password !== hash) { setError(t.member_login_error); return; }
    onAuthed(key);
  }

  async function handleRegister() {
    setError("");
    if (password.length < 6) { setError(t.password_too_short); return; }
    if (password !== confirm) { setError(t.password_mismatch); return; }
    setBusy(true);
    const hash = await sha256Hex(password);
    const result = registerAccount(phone, name, hash);
    setBusy(false);
    if (!result.ok) {
      if (result.reason === "exists") setError(t.account_exists);
      else setError(t.member_login_error);
      return;
    }
    onAuthed(phone.trim());
  }

  const canLogin = phone.trim() && password;
  const canRegister = phone.trim() && name.trim() && password && confirm;

  return (
    <div>
      <SectionTitle icon="💳">{mode === "login" ? t.member_login_title : t.member_register_title}</SectionTitle>
      <div className="ev-card" style={{ padding: 20, maxWidth: 380 }}>
        <label className="ev-label">{t.phone_label}</label>
        <input className="ev-input" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ marginBottom: 10 }} />

        {mode === "register" && (
          <>
            <label className="ev-label">{t.full_name_label}</label>
            <input className="ev-input" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 10 }} />
          </>
        )}

        <label className="ev-label">{t.password}</label>
        <input className="ev-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: 10 }} />

        {mode === "register" && (
          <>
            <label className="ev-label">{t.confirm_password}</label>
            <input className="ev-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={{ marginBottom: 10 }} />
          </>
        )}

        {error && <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 10 }}>{error}</div>}

        <button
          className="ev-btn ev-btn-primary"
          style={{ width: "100%", marginBottom: 12 }}
          disabled={busy || (mode === "login" ? !canLogin : !canRegister)}
          onClick={mode === "login" ? handleLogin : handleRegister}
        >
          {mode === "login" ? t.login : t.register_now}
        </button>

        <button
          className="ev-btn ev-btn-ghost"
          style={{ width: "100%", fontSize: 12.5 }}
          onClick={() => switchMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? t.switch_to_register : t.switch_to_login}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN APP
   ============================================================ */
function AdminApp({ lang, menu, setMenu, promotions, setPromotions, banners, setBanners, orders, setOrders, updateOrderStatus, verifySlip, members, setMembers, qrImage, setQrImage, settings, setSettings, placeOrder }) {
  const t = T[lang];
  const [role, setRole] = useState(null); // null | "staff" | "manager"
  const [tab, setTab] = useState("pos");

  if (!role) return <AdminLogin t={t} onLogin={(r) => { setRole(r); setTab("pos"); }} />;

  const fullNavItems = [
    ["pos", t.nav_pos, "🧮"], ["dashboard", t.nav_dashboard, "📊"], ["orders", t.nav_orders, "🧾"], ["kitchen", t.nav_kitchen, "☕"],
    ["menu", t.nav_menu_mgmt, "📋"], ["promo", t.nav_promo, "🏷️"], ["banner", t.nav_banner, "📢"], ["members", t.nav_members, "💳"],
    ["settings", t.nav_settings, "⚙️"], ["reports", t.nav_reports, "📈"],
  ];
  // Staff logins only get the counter-facing tabs: selling (POS), managing
  // orders, and the kitchen screen. Everything else (menu, promo, banners,
  // members, settings, reports) is manager-only.
  const navItems = role === "staff" ? fullNavItems.filter(([key]) => STAFF_TABS.includes(key)) : fullNavItems;
  const activeTab = navItems.some(([key]) => key === tab) ? tab : navItems[0][0];

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div className="ev-nav-side" style={{ display: "flex", flexDirection: "column" }}>
        <div className="ev-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{t.brand}</div>
        <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 20 }}>{role === "staff" ? t.welcome_staff : t.welcome_admin}</div>
        <div style={{ flex: 1 }}>
          {navItems.map(([key, label, icon]) => (
            <button key={key} className={activeTab === key ? "active" : ""} onClick={() => setTab(key)}>{icon} &nbsp;{label}</button>
          ))}
        </div>
        <button onClick={() => setRole(null)} style={{ color: "rgba(246,241,230,0.6)" }}>↩ {t.logout}</button>
      </div>
      <div className="ev-scroll" style={{ flex: 1, padding: 22 }}>
        {activeTab === "pos" && <PosTab t={t} lang={lang} menu={menu} settings={settings} members={members} placeOrder={placeOrder} updateOrderStatus={updateOrderStatus} />}
        {activeTab === "dashboard" && <DashboardTab t={t} lang={lang} orders={orders} menu={menu} />}
        {activeTab === "orders" && <OrdersTab t={t} lang={lang} orders={orders} updateOrderStatus={updateOrderStatus} verifySlip={verifySlip} />}
        {activeTab === "kitchen" && <KitchenTab t={t} lang={lang} orders={orders} updateOrderStatus={updateOrderStatus} verifySlip={verifySlip} />}
        {activeTab === "menu" && <MenuMgmtTab t={t} lang={lang} menu={menu} setMenu={setMenu} />}
        {activeTab === "promo" && <PromoTab t={t} lang={lang} promotions={promotions} setPromotions={setPromotions} />}
        {activeTab === "banner" && <BannerTab t={t} lang={lang} banners={banners} setBanners={setBanners} />}
        {activeTab === "members" && <MembersTab t={t} lang={lang} members={members} setMembers={setMembers} orders={orders} />}
        {activeTab === "settings" && <SettingsTab t={t} lang={lang} settings={settings} setSettings={setSettings} qrImage={qrImage} setQrImage={setQrImage} />}
        {activeTab === "reports" && <ReportsTab t={t} lang={lang} orders={orders} />}
      </div>
    </div>
  );
}

function AdminLogin({ t, onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  function submit() {
    const e = email.trim().toLowerCase();
    if (e === STAFF_EMAIL.toLowerCase() && pass === STAFF_PASS) { setErr(""); onLogin("staff"); }
    else if (e === MANAGER_EMAIL.toLowerCase() && pass === MANAGER_PASS) { setErr(""); onLogin("manager"); }
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

/* ---------------- POS — in-store point of sale ----------------
   Lets staff behind the counter build an order from the same live menu the
   web/customer app uses, then take payment on the spot. Orders are written
   through the same shared `placeOrder` used by the customer app, so they
   land in the same orders list — Kitchen, Orders, Reports, Dashboard, and
   the customer's own order tracking all see POS sales immediately (this
   is what keeps the till "connected" to the rest of the store system).
   Because the sale is being paid in person, POS orders skip the online
   QR-slip-verification step and are marked "completed" the moment payment
   is taken, crediting loyalty points right away if a phone number was given. */
function PosTab({ t, lang, menu, settings, members, placeOrder, updateOrderStatus }) {
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [detailItem, setDetailItem] = useState(null);
  const [cart, setCart] = useState([]);
  const [phone, setPhone] = useState("");
  const [custName, setCustName] = useState("");
  const enabledPayments = ["cash", "qr", "transfer", "card"].filter((p) => settings.payments && settings.payments[p]);
  const [payment, setPayment] = useState(enabledPayments[0] || "cash");
  const [cashReceived, setCashReceived] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (!enabledPayments.includes(payment)) setPayment(enabledPayments[0] || "");
  }, [settings]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredMenu = useMemo(() => {
    return menu.filter((m) => m.available !== false)
      .filter((m) => (activeCat === "all" ? true : m.cat === activeCat))
      .filter((m) => {
        if (!search.trim()) return true;
        const s = search.toLowerCase();
        return m.nameTh.toLowerCase().includes(s) || m.nameEn.toLowerCase().includes(s);
      });
  }, [menu, activeCat, search]);

  function addToCart(entry) { setCart((c) => [...c, entry]); }
  function removeFromCart(idx) { setCart((c) => c.filter((_, i) => i !== idx)); }
  function updateQty(idx, delta) {
    setCart((c) => c.map((it, i) => (i === idx ? { ...it, qty: Math.max(1, it.qty + delta) } : it)));
  }
  const total = cart.reduce((s, it) => s + it.lineTotal, 0);
  const member = members && phone.trim() ? members[phone.trim()] : null;
  const cashNum = Number(cashReceived) || 0;
  const changeDue = payment === "cash" ? Math.max(0, cashNum - total) : 0;
  const cashOk = payment !== "cash" || cashNum >= total;
  const canCharge = cart.length > 0 && !!payment && cashOk;

  function chargeSale() {
    if (!canCharge) return;
    const info = {
      fulfil: "pos", when: "now", payment,
      name: (member && member.name) || custName.trim() || t.pos_walkin_name,
      phone: phone.trim(), address: "",
      coupon: null, discount: 0, deliveryFee: 0,
      pointsRedeemed: 0, pointsDiscount: 0, grandTotal: total,
      slipImage: null,
      cashReceived: payment === "cash" ? cashNum : null,
      changeDue: payment === "cash" ? changeDue : null,
    };
    const order = placeOrder(cart, info, total);
    // Paid in person at the counter — mark it done straight away (this also
    // credits loyalty points immediately if a phone number was entered).
    updateOrderStatus(order.id, "completed");
    setCompletedOrder({ ...order, status: "completed" });
    setCart([]);
    setPhone(""); setCustName(""); setCashReceived("");
  }

  function startNewSale() {
    setCompletedOrder(null);
  }

  if (completedOrder) {
    const earned = member ? Math.floor(total / getLoyaltyConfig(settings).earnPerBaht) : 0;
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 20 }}>
        <div className="ev-card" style={{ padding: 26, width: "100%", maxWidth: 380, textAlign: "center" }}>
          <div style={{ fontSize: 42, marginBottom: 6 }}>✅</div>
          <h2 className="ev-display" style={{ margin: "0 0 4px", color: "var(--forest)" }}>{t.pos_sale_success}</h2>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 18 }}>{t.pos_receipt_no}: <b>{completedOrder.id}</b></div>
          <div style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "12px 0", marginBottom: 16, textAlign: "left" }}>
            {completedOrder.items.map((it, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                <span>{it.qty}× {lang === "th" ? it.nameTh : it.nameEn}</span>
                <span><Money v={it.lineTotal} /></span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
            <span>{t.total}</span><span><Money v={completedOrder.grandTotal} /></span>
          </div>
          {completedOrder.payment === "cash" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, opacity: 0.7 }}>
                <span>{t.pos_cash_received}</span><span><Money v={completedOrder.cashReceived || 0} /></span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, opacity: 0.7, marginBottom: 10 }}>
                <span>{t.pos_change_due}</span><span><Money v={completedOrder.changeDue || 0} /></span>
              </div>
            </>
          )}
          {member && earned > 0 && (
            <div className="ev-chip" style={{ marginBottom: 16 }}>⭐ {t.pos_points_earned}: +{earned}</div>
          )}
          <button className="ev-btn ev-btn-primary" style={{ width: "100%" }} onClick={startNewSale}>{t.pos_new_sale}</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle icon="🧮">{t.pos_title}</SectionTitle>
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Menu picker */}
        <div style={{ flex: "2 1 340px", minWidth: 280 }}>
          <input className="ev-input" placeholder={t.pos_search_ph} value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
            {["all", ...CATS].map((c) => (
              <button key={c} onClick={() => setActiveCat(c)} className="ev-chip"
                style={{
                  cursor: "pointer", border: "none", whiteSpace: "nowrap",
                  background: activeCat === c ? "var(--forest)" : "rgba(31,58,46,0.08)",
                  color: activeCat === c ? "#fff" : "var(--forest)",
                }}>
                {c === "all" ? t.all_cat : t[`cat_${c}`]}
              </button>
            ))}
          </div>
          {filteredMenu.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, opacity: 0.6, fontSize: 13 }}>{t.search_no_result}</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10 }}>
              {filteredMenu.map((item) => (
                <MenuCard key={item.id} item={item} lang={lang} t={t} onClick={() => setDetailItem(item)} />
              ))}
            </div>
          )}
        </div>

        {/* Order / checkout panel */}
        <div className="ev-card" style={{ flex: "1 1 300px", minWidth: 280, padding: 16, position: "sticky", top: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>{t.pos_cart_title}</span>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} style={{ background: "none", border: "none", color: "var(--danger)", fontSize: 11.5, cursor: "pointer" }}>
                {t.pos_clear_cart}
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div style={{ fontSize: 12.5, opacity: 0.55, padding: "20px 0", textAlign: "center" }}>{t.pos_cart_empty}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14, maxHeight: 260, overflowY: "auto" }}>
              {cart.map((it, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 12.5 }}>{lang === "th" ? it.nameTh : it.nameEn}</div>
                    <div style={{ fontSize: 10.5, opacity: 0.6 }}>
                      {t[it.temp]} · {it.sweet}% · {t[`ice_${it.ice}`]}
                      {it.addons.length > 0 && ` · +${it.addons.length}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button className="qty-btn" style={{ width: 22, height: 22, fontSize: 12 }} onClick={() => updateQty(i, -1)}>−</button>
                    <span style={{ fontSize: 11.5, fontWeight: 700, minWidth: 14, textAlign: "center" }}>{it.qty}</span>
                    <button className="qty-btn" style={{ width: 22, height: 22, fontSize: 12 }} onClick={() => updateQty(i, 1)}>+</button>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 12.5, minWidth: 48, textAlign: "right" }}><Money v={it.lineTotal} /></div>
                  <button onClick={() => removeFromCart(i)} style={{ background: "none", border: "none", color: "var(--danger)", fontSize: 14, cursor: "pointer", padding: 0 }}>×</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, marginBottom: 14, paddingTop: 6, borderTop: "1.5px solid var(--line)" }}>
            <span>{t.total}</span><span><Money v={total} /></span>
          </div>

          <div style={{ marginBottom: 4, fontSize: 11.5, fontWeight: 700, opacity: 0.7 }}>{t.pos_customer_title}</div>
          <div style={{ fontSize: 10.5, opacity: 0.5, marginBottom: 8 }}>{t.pos_customer_hint}</div>
          <input className="ev-input" placeholder={t.phone} value={phone} onChange={(e) => setPhone(e.target.value)} style={{ marginBottom: 8, fontSize: 13 }} />
          {phone.trim() && (
            member ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(124,154,130,0.15)", borderRadius: 10, padding: "8px 10px", marginBottom: 10, fontSize: 12 }}>
                <span>✅ <b>{member.name || phone}</b> · {member.points} pt</span>
                <TierBadge tier={tierOf(member.totalSpent)} t={t} />
              </div>
            ) : (
              <input className="ev-input" placeholder={t.pos_walkin_name} value={custName} onChange={(e) => setCustName(e.target.value)} style={{ marginBottom: 10, fontSize: 13 }} />
            )
          )}

          <div style={{ marginBottom: 6, fontSize: 11.5, fontWeight: 700, opacity: 0.7 }}>{t.pos_payment_title}</div>
          {enabledPayments.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--danger)", marginBottom: 10 }}>{t.pos_no_payment}</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
              {enabledPayments.map((p) => (
                <button key={p} onClick={() => setPayment(p)} className="ev-btn"
                  style={{ padding: "8px", fontSize: 12, background: payment === p ? "var(--forest)" : "#fff", color: payment === p ? "#fff" : "var(--cocoa)", border: "1.5px solid var(--line)" }}>
                  {t[p]}
                </button>
              ))}
            </div>
          )}

          {payment === "cash" && (
            <div style={{ marginBottom: 10 }}>
              <label className="ev-label">{t.pos_cash_received}</label>
              <input className="ev-input" type="number" min={0} value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} style={{ marginBottom: 6 }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
                <span>{t.pos_change_due}</span>
                <span style={{ color: cashOk ? "var(--forest)" : "var(--danger)" }}><Money v={changeDue} /></span>
              </div>
              {!cashOk && cashReceived !== "" && (
                <div style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 4 }}>{t.pos_cash_insufficient}</div>
              )}
            </div>
          )}

          <button className="ev-btn ev-btn-terracotta" style={{ width: "100%", padding: "13px", fontSize: 14 }} disabled={!canCharge} onClick={chargeSale}>
            {t.pos_complete_sale} · <Money v={total} />
          </button>
        </div>
      </div>

      {detailItem && (
        <ItemDetailModal t={t} lang={lang} item={detailItem} onClose={() => setDetailItem(null)}
          onAdd={(entry) => { addToCart(entry); setDetailItem(null); }} />
      )}
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

function OrdersTab({ t, lang, orders, updateOrderStatus, verifySlip }) {
  const [viewSlip, setViewSlip] = useState(null);
  const sorted = [...orders].sort((a, b) => b.createdAt - a.createdAt);
  return (
    <div>
      <SectionTitle icon="🧾">{t.order_mgmt_title}</SectionTitle>
      <div style={{ overflowX: "auto" }}>
        <table className="ev-table">
          <thead><tr>
            <th>{t.col_order}</th><th>{t.col_time}</th><th>{t.col_customer}</th><th>{t.col_items}</th>
            <th>{t.col_total}</th><th>{t.slip_preview}</th><th>{t.col_status}</th><th>{t.col_action}</th>
          </tr></thead>
          <tbody>
            {sorted.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 700 }}>{o.id}</td>
                <td>{new Date(o.createdAt).toLocaleTimeString(lang === "th" ? "th-TH" : "en-US", { hour: "2-digit", minute: "2-digit" })}</td>
                <td>{o.name}</td>
                <td>{o.items.length} {t.items}</td>
                <td><Money v={o.grandTotal} /></td>
                <td>
                  {o.payment === "qr" ? (
                    o.slipImage ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <img src={o.slipImage} alt="slip" onClick={() => setViewSlip(o.slipImage)}
                          style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 4, cursor: "pointer", border: "1px solid var(--line)" }} />
                        {o.slipVerified ? (
                          <span className="ev-status-badge" style={{ background: "#7C9A8222", color: "#1F3A2E", fontSize: 10 }}>✓</span>
                        ) : (
                          <button className="ev-btn ev-btn-ghost" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => verifySlip(o.id)}>
                            {lang === "th" ? "ยืนยัน" : "Verify"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--danger)" }}>{t.slip_not_attached}</span>
                    )
                  ) : "—"}
                </td>
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
      {viewSlip && (
        <div className="ev-modal-backdrop" onClick={() => setViewSlip(null)}>
          <div className="ev-modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: "center", maxWidth: 360 }}>
            <img src={viewSlip} alt="slip" style={{ maxWidth: "100%", borderRadius: 10 }} />
          </div>
        </div>
      )}
    </div>
  );
}

function KitchenTab({ t, lang, orders, updateOrderStatus, verifySlip }) {
  const [viewSlip, setViewSlip] = useState(null);
  const active = orders.filter((o) => o.status === "received" || o.status === "preparing")
    .sort((a, b) => a.createdAt - b.createdAt);
  return (
    <div>
      <SectionTitle icon="☕">{t.kitchen_title}</SectionTitle>
      {active.length === 0 && <div style={{ opacity: 0.5, padding: 30, textAlign: "center" }}>{t.no_active}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
        {active.map((o) => {
          const blockedBySlip = o.status === "received" && o.payment === "qr" && !o.slipVerified;
          return (
            <div key={o.id} className="ev-card" style={{ padding: 14, borderLeft: `4px solid ${blockedBySlip ? "var(--danger)" : STATUS_COLORS[o.status]}` }}>
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

              {o.payment === "qr" && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed var(--line)" }}>
                  {o.slipImage ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <img src={o.slipImage} alt="slip" onClick={() => setViewSlip(o.slipImage)}
                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, cursor: "pointer", border: "1px solid var(--line)" }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: o.slipVerified ? "var(--forest)" : "var(--gold)" }}>
                        {o.slipVerified ? `✓ ${t.slip_verified}` : t.slip_pending_admin}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--danger)" }}>{t.slip_not_attached}</span>
                  )}
                </div>
              )}

              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                {o.status === "received" && blockedBySlip && (
                  <button className="ev-btn ev-btn-outline" style={{ flex: 1, padding: "8px", fontSize: 12, borderColor: "var(--gold)", color: "var(--gold)" }}
                    onClick={() => verifySlip(o.id)}>
                    {t.verify_slip}
                  </button>
                )}
                {o.status === "received" && !blockedBySlip && (
                  <button className="ev-btn ev-btn-terracotta" style={{ flex: 1, padding: "8px", fontSize: 12 }} onClick={() => updateOrderStatus(o.id, "preparing")}>{t.start}</button>
                )}
                {o.status === "preparing" && (
                  <button className="ev-btn ev-btn-primary" style={{ flex: 1, padding: "8px", fontSize: 12 }} onClick={() => updateOrderStatus(o.id, "ready")}>{t.done}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {viewSlip && (
        <div className="ev-modal-backdrop" onClick={() => setViewSlip(null)}>
          <div className="ev-modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: "center", maxWidth: 360 }}>
            <img src={viewSlip} alt="slip" style={{ maxWidth: "100%", borderRadius: 10 }} />
          </div>
        </div>
      )}
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
        <button className="ev-btn ev-btn-primary" style={{ marginBottom: 14 }} onClick={() => setEditing({ cat: "coffee", colors: ["#c9a876", "#2b1810"], available: true, temps: ["iced"], sweetAdjust: true, iceAdjust: true, addonIds: ALL_ADDON_IDS })}>{t.add_item}</button>
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
      {editing && <MenuItemModal t={t} lang={lang} item={editing} onClose={() => setEditing(null)} onSave={saveItem} />}
    </div>
  );
}

function MenuItemModal({ t, lang, item, onClose, onSave }) {
  const [form, setForm] = useState({
    nameTh: "", nameEn: "", price: 40, cat: "coffee", recommended: false, available: true,
    colors: ["#c9a876", "#2b1810"], temps: ["iced"], sweetAdjust: true, iceAdjust: true, addonIds: ALL_ADDON_IDS,
    ...item,
  });

  function toggleTemp(opt) {
    setForm((f) => {
      const has = f.temps.includes(opt);
      const next = has ? f.temps.filter((x) => x !== opt) : [...f.temps, opt];
      return { ...f, temps: next.length ? next : [opt] }; // always keep at least one
    });
  }
  function toggleFormAddon(id) {
    setForm((f) => ({ ...f, addonIds: f.addonIds.includes(id) ? f.addonIds.filter((x) => x !== id) : [...f.addonIds, id] }));
  }

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
        <input className="ev-input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} style={{ marginBottom: 14 }} />

        <label className="ev-label">{t.temp_options}</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {["hot", "iced", "frappe"].map((opt) => (
            <button key={opt} type="button" onClick={() => toggleTemp(opt)} className="ev-btn"
              style={{ flex: 1, padding: "7px 4px", fontSize: 12, background: form.temps.includes(opt) ? "var(--forest)" : "#fff", color: form.temps.includes(opt) ? "#fff" : "var(--cocoa)", border: "1.5px solid var(--line)" }}>
              {t[opt]}
            </button>
          ))}
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 8 }}>
          <input type="checkbox" checked={form.sweetAdjust !== false} onChange={(e) => setForm({ ...form, sweetAdjust: e.target.checked })} /> {t.sweet_adjustable}
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 12 }}>
          <input type="checkbox" checked={form.iceAdjust !== false} onChange={(e) => setForm({ ...form, iceAdjust: e.target.checked })} /> {t.ice_adjustable}
        </label>

        <label className="ev-label">{t.available_addons}</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          {ADDONS.map((a) => (
            <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={form.addonIds.includes(a.id)} onChange={() => toggleFormAddon(a.id)} />
              <span>{lang === "th" ? a.th : a.en}</span>
            </label>
          ))}
        </div>

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
  function save(p) {
    if (p.id && promotions.find((x) => x.id === p.id)) setPromotions(promotions.map((x) => (x.id === p.id ? p : x)));
    else setPromotions([...promotions, { ...p, id: "pr" + Date.now() }]);
    setEditing(null);
  }
  function remove(id) { if (window.confirm(t.confirm_delete)) setPromotions(promotions.filter((x) => x.id !== id)); }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionTitle icon="🏷️">{t.promo_title}</SectionTitle>
        <button className="ev-btn ev-btn-primary" style={{ marginBottom: 14 }} onClick={() => setEditing({ type: "percent", value: 10 })}>{t.add_promo}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
        {promotions.map((p) => (
          <div key={p.id} className="ev-card" style={{ padding: 14 }}>
            <div className="ev-chip" style={{ marginBottom: 8 }}>{p.code}</div>
            <div style={{ fontWeight: 700 }}>{lang === "th" ? p.name_th : p.name_en}</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 10 }}>
              {p.type === "percent" ? `${t.percent}: ${p.value}%` : `${t.fixed}: ฿${p.value}`}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ev-btn ev-btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditing(p)}>{t.edit}</button>
              <button className="ev-btn ev-btn-ghost" style={{ fontSize: 12, color: "var(--danger)" }} onClick={() => remove(p.id)}>{t.delete}</button>
            </div>
          </div>
        ))}
      </div>
      {editing && <PromoModal t={t} promo={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function PromoModal({ t, promo, onClose, onSave }) {
  const [form, setForm] = useState({ code: "", name_th: "", name_en: "", type: "percent", value: 10, ...promo });
  return (
    <div className="ev-modal-backdrop" onClick={onClose}>
      <div className="ev-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 360 }}>
        <h3 className="ev-display" style={{ marginTop: 0 }}>{t.add_promo}</h3>
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
          <button className="ev-btn ev-btn-primary" style={{ flex: 1 }} onClick={() => onSave(form)}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

function BannerTab({ t, lang, banners, setBanners }) {
  const [editing, setEditing] = useState(null);
  function save(b) {
    if (b.id && banners.find((x) => x.id === b.id)) setBanners(banners.map((x) => (x.id === b.id ? b : x)));
    else setBanners([...banners, { ...b, id: "bn" + Date.now() }]);
    setEditing(null);
  }
  function remove(id) { if (window.confirm(t.confirm_delete)) setBanners(banners.filter((x) => x.id !== id)); }
  function move(id, dir) {
    const i = banners.findIndex((x) => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= banners.length) return;
    const next = [...banners];
    [next[i], next[j]] = [next[j], next[i]];
    setBanners(next);
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionTitle icon="📢">{t.banner_section_title}</SectionTitle>
        <button className="ev-btn ev-btn-primary" style={{ marginBottom: 14 }} onClick={() => setEditing({ active: true })}>{t.add_banner}</button>
      </div>
      {banners.length === 0 ? (
        <div style={{ opacity: 0.5, fontSize: 13 }}>{t.no_banners}</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
          {banners.map((b, i) => (
            <div key={b.id} className="ev-card" style={{ padding: 12 }}>
              {b.image && <img src={b.image} alt="" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />}
              <div style={{ fontWeight: 700, fontSize: 13 }}>{(lang === "th" ? b.title_th : b.title_en) || "—"}</div>
              {!b.active && <div className="ev-chip" style={{ marginTop: 6, background: "rgba(181,73,58,0.1)", color: "var(--danger)" }}>{lang === "th" ? "ปิดการแสดงผล" : "Hidden"}</div>}
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                <button className="ev-btn ev-btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditing(b)}>{t.edit}</button>
                <button className="ev-btn ev-btn-ghost" style={{ fontSize: 12, color: "var(--danger)" }} onClick={() => remove(b.id)}>{t.delete}</button>
                <button className="ev-btn ev-btn-ghost" style={{ fontSize: 12 }} disabled={i === 0} onClick={() => move(b.id, -1)}>↑</button>
                <button className="ev-btn ev-btn-ghost" style={{ fontSize: 12 }} disabled={i === banners.length - 1} onClick={() => move(b.id, 1)}>↓</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && <BannerModal t={t} banner={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function BannerModal({ t, banner, onClose, onSave }) {
  const [form, setForm] = useState({ image: "", title_th: "", title_en: "", desc_th: "", desc_en: "", active: true, ...banner });
  const [error, setError] = useState("");

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError(t.banner_upload_required); return; }
    if (file.size > 4 * 1024 * 1024) { setError(t.banner_upload_required); return; }
    const reader = new FileReader();
    reader.onload = () => { setError(""); setForm((f) => ({ ...f, image: reader.result })); };
    reader.onerror = () => setError(t.banner_upload_required);
    reader.readAsDataURL(file);
  }
  function submit() {
    if (!form.image) { setError(t.banner_upload_required); return; }
    onSave(form);
  }

  return (
    <div className="ev-modal-backdrop" onClick={onClose}>
      <div className="ev-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <h3 className="ev-display" style={{ marginTop: 0 }}>{banner && banner.id ? t.edit_banner : t.add_banner}</h3>

        <label className="ev-label">{t.banner_image_label}</label>
        {form.image && (
          <img src={form.image} alt="" style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 8, marginBottom: 8, border: "1px solid var(--line)" }} />
        )}
        <input type="file" accept="image/*" onChange={handleFile} style={{ fontSize: 13, marginBottom: 10 }} />

        <label className="ev-label">{t.banner_title_label} (TH)</label>
        <input className="ev-input" value={form.title_th} onChange={(e) => setForm({ ...form, title_th: e.target.value })} placeholder={t.banner_text_ph} style={{ marginBottom: 10 }} />
        <label className="ev-label">{t.banner_title_label} (EN)</label>
        <input className="ev-input" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} style={{ marginBottom: 10 }} />
        <label className="ev-label">{t.banner_desc_label} (TH)</label>
        <input className="ev-input" value={form.desc_th} onChange={(e) => setForm({ ...form, desc_th: e.target.value })} style={{ marginBottom: 10 }} />
        <label className="ev-label">{t.banner_desc_label} (EN)</label>
        <input className="ev-input" value={form.desc_en} onChange={(e) => setForm({ ...form, desc_en: e.target.value })} style={{ marginBottom: 12 }} />

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 16, cursor: "pointer" }}>
          <input type="checkbox" checked={form.active !== false} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          {t.banner_active}
        </label>

        {error && <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 10 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ev-btn ev-btn-outline" style={{ flex: 1 }} onClick={onClose}>{t.cancel}</button>
          <button className="ev-btn ev-btn-primary" style={{ flex: 1 }} onClick={submit}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

function MembersTab({ t, lang, members, setMembers, orders }) {
  const [editing, setEditing] = useState(null); // phone key
  const [editVal, setEditVal] = useState(0);
  const list = Object.values(members || {}).sort((a, b) => b.totalSpent - a.totalSpent);
  const orderCountFor = (phone) => orders.filter((o) => o.phone === phone).length;

  function startEdit(m) { setEditing(m.phone); setEditVal(m.points); }
  function saveEdit(phone) {
    const next = { ...members, [phone]: { ...members[phone], points: Math.max(0, Number(editVal) || 0) } };
    setMembers(next);
    setEditing(null);
  }

  return (
    <div>
      <SectionTitle icon="💳">{t.members_title}</SectionTitle>
      {list.length === 0 ? (
        <div style={{ opacity: 0.5, padding: 30, textAlign: "center" }}>{t.no_members}</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="ev-table">
            <thead><tr>
              <th>{t.col_name}</th><th>{t.col_phone}</th><th>{t.col_tier}</th>
              <th>{t.col_points}</th><th>{t.col_spent}</th><th>{t.col_orders}</th><th></th>
            </tr></thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.phone}>
                  <td>{m.name || "-"}</td>
                  <td>{m.phone}</td>
                  <td><TierBadge tier={tierOf(m.totalSpent)} t={t} /></td>
                  <td>
                    {editing === m.phone ? (
                      <input className="ev-input" type="number" style={{ width: 80, padding: "5px 8px" }}
                        value={editVal} onChange={(e) => setEditVal(e.target.value)} />
                    ) : (
                      <b>{m.points}</b>
                    )}
                  </td>
                  <td>฿{m.totalSpent.toFixed(0)}</td>
                  <td>{orderCountFor(m.phone)}</td>
                  <td>
                    {editing === m.phone ? (
                      <button className="ev-btn ev-btn-ghost" style={{ fontSize: 12 }} onClick={() => saveEdit(m.phone)}>{t.save}</button>
                    ) : (
                      <button className="ev-btn ev-btn-ghost" style={{ fontSize: 12 }} onClick={() => startEdit(m)}>{t.edit}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SettingsTab({ t, lang, settings, setSettings, qrImage, setQrImage }) {
  const [form, setForm] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...JSON.parse(JSON.stringify(settings)),
    // Merge defensively: settings saved before the loyalty feature existed won't have this key yet.
    loyalty: { ...DEFAULT_SETTINGS.loyalty, ...(settings && settings.loyalty ? settings.loyalty : {}) },
  }));
  const [providerTh, setProviderTh] = useState("");
  const [providerEn, setProviderEn] = useState("");
  const [saved, setSaved] = useState(false);

  function togglePayment(key) {
    setForm((f) => ({ ...f, payments: { ...f.payments, [key]: !f.payments[key] } }));
  }
  function updateBank(field, val) {
    setForm((f) => ({ ...f, bank: { ...f.bank, [field]: val } }));
  }
  function toggleFulfil(key) {
    setForm((f) => ({ ...f, fulfillment: { ...f.fulfillment, [key]: !f.fulfillment[key] } }));
  }
  function updateDeliveryFee(val) {
    setForm((f) => ({ ...f, fulfillment: { ...f.fulfillment, deliveryFee: Number(val) || 0 } }));
  }
  function updateLoyalty(field, val) {
    setForm((f) => ({ ...f, loyalty: { ...f.loyalty, [field]: val } }));
  }
  function addProvider() {
    if (!providerTh.trim() || !providerEn.trim()) return;
    const id = "prov" + Date.now();
    setForm((f) => ({ ...f, deliveryProviders: [...f.deliveryProviders, { id, th: providerTh.trim(), en: providerEn.trim() }] }));
    setProviderTh(""); setProviderEn("");
  }
  function removeProvider(id) {
    setForm((f) => ({ ...f, deliveryProviders: f.deliveryProviders.filter((p) => p.id !== id) }));
  }
  function save() {
    setSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div>
      <SectionTitle icon="⚙️">{t.settings_title}</SectionTitle>

      <div className="ev-card" style={{ padding: 16, marginBottom: 16, maxWidth: 460 }}>
        <div className="ev-eyebrow" style={{ marginBottom: 10 }}>{t.payment_methods}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {["qr", "transfer", "card", "cash"].map((p) => (
            <label key={p} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={!!form.payments[p]} onChange={() => togglePayment(p)} /> {t[p]}
            </label>
          ))}
        </div>
      </div>

      <div className="ev-card" style={{ padding: 16, marginBottom: 16, maxWidth: 460 }}>
        <div className="ev-eyebrow" style={{ marginBottom: 10 }}>{t.bank_info}</div>
        <label className="ev-label">{t.bank_name}</label>
        <input className="ev-input" value={form.bank.bankName} onChange={(e) => updateBank("bankName", e.target.value)} style={{ marginBottom: 10 }} />
        <label className="ev-label">{t.account_no}</label>
        <input className="ev-input" value={form.bank.accountNo} onChange={(e) => updateBank("accountNo", e.target.value)} style={{ marginBottom: 10 }} />
        <label className="ev-label">{t.account_name}</label>
        <input className="ev-input" value={form.bank.accountName} onChange={(e) => updateBank("accountName", e.target.value)} />
      </div>

      <div className="ev-card" style={{ padding: 16, marginBottom: 16, maxWidth: 460 }}>
        <div className="ev-eyebrow" style={{ marginBottom: 10 }}>{t.fulfillment_settings}</div>
        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={!!form.fulfillment.pickup} onChange={() => toggleFulfil("pickup")} /> {t.enable_pickup}
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={!!form.fulfillment.delivery} onChange={() => toggleFulfil("delivery")} /> {t.enable_delivery}
          </label>
        </div>
        <label className="ev-label">{t.delivery_fee}</label>
        <input className="ev-input" type="number" value={form.fulfillment.deliveryFee}
          onChange={(e) => updateDeliveryFee(e.target.value)} style={{ marginBottom: 16, maxWidth: 160 }} />

        <label className="ev-label">{t.delivery_providers}</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {form.deliveryProviders.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, background: "rgba(31,58,46,0.05)", borderRadius: 8, padding: "7px 10px" }}>
              <span style={{ flex: 1 }}>{p.th} / {p.en}</span>
              <button className="ev-btn ev-btn-ghost" style={{ fontSize: 12, color: "var(--danger)" }} onClick={() => removeProvider(p.id)}>{t.remove}</button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input className="ev-input" placeholder={t.provider_name_th} value={providerTh} onChange={(e) => setProviderTh(e.target.value)} style={{ flex: "1 1 120px" }} />
          <input className="ev-input" placeholder={t.provider_name_en} value={providerEn} onChange={(e) => setProviderEn(e.target.value)} style={{ flex: "1 1 120px" }} />
          <button className="ev-btn ev-btn-outline" onClick={addProvider} style={{ whiteSpace: "nowrap" }}>{t.add_provider}</button>
        </div>
      </div>

      <div className="ev-card" style={{ padding: 16, marginBottom: 16, maxWidth: 460 }}>
        <div className="ev-eyebrow" style={{ marginBottom: 10 }}>{t.loyalty_settings}</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 14 }}>
          <input type="checkbox" checked={form.loyalty.enabled !== false} onChange={(e) => updateLoyalty("enabled", e.target.checked)} />
          {t.loyalty_enabled}
        </label>

        <label className="ev-label">{t.loyalty_earn_rate}</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 13 }}>฿</span>
          <input className="ev-input" type="number" min={1} value={form.loyalty.earnPerBaht}
            onChange={(e) => updateLoyalty("earnPerBaht", Number(e.target.value) || 1)} style={{ maxWidth: 100 }} />
          <span style={{ fontSize: 13 }}>{t.loyalty_earn_rate_suffix}</span>
        </div>

        <label className="ev-label">{t.loyalty_redeem_rate}</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <input className="ev-input" type="number" min={1} value={form.loyalty.redeemPoints}
            onChange={(e) => updateLoyalty("redeemPoints", Number(e.target.value) || 1)} style={{ maxWidth: 100 }} />
          <span style={{ fontSize: 13 }}>{t.loyalty_points_word}</span>
          <span style={{ fontSize: 13 }}>=</span>
          <span style={{ fontSize: 13 }}>฿</span>
          <input className="ev-input" type="number" min={0} value={form.loyalty.redeemValue}
            onChange={(e) => updateLoyalty("redeemValue", Number(e.target.value) || 0)} style={{ maxWidth: 100 }} />
        </div>
        <div style={{ fontSize: 11.5, opacity: 0.55 }}>
          {lang === "th"
            ? `ลูกค้าจะกรอกโค้ด "POINT${form.loyalty.redeemPoints}" ในช่องคูปองเพื่อแลกส่วนลด (พิมพ์ POINT${form.loyalty.redeemPoints * 2} เพื่อแลก 2 เท่า และเป็นเช่นนี้ไปเรื่อยๆ)`
            : `Customers type "POINT${form.loyalty.redeemPoints}" in the coupon field to redeem (or POINT${form.loyalty.redeemPoints * 2} for double, and so on)`}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button className="ev-btn ev-btn-primary" onClick={save}>{t.save}</button>
        {saved && <span style={{ fontSize: 12, color: "var(--forest)", fontWeight: 700 }}>✓ {lang === "th" ? "บันทึกแล้ว" : "Saved"}</span>}
      </div>

      <QrSettingsTab t={t} lang={lang} qrImage={qrImage} setQrImage={setQrImage} />
    </div>
  );
}

function QrSettingsTab({ t, lang, qrImage, setQrImage }) {
  const [preview, setPreview] = useState(qrImage || "");
  const [error, setError] = useState("");

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError(lang === "th" ? "กรุณาเลือกไฟล์รูปภาพ" : "Please select an image file"); return; }
    if (file.size > 4 * 1024 * 1024) { setError(lang === "th" ? "ไฟล์ใหญ่เกิน 4MB" : "File exceeds 4MB"); return; }
    const reader = new FileReader();
    reader.onload = () => { setError(""); setPreview(reader.result); setQrImage(reader.result); };
    reader.onerror = () => setError(lang === "th" ? "อ่านไฟล์ไม่สำเร็จ" : "Failed to read file");
    reader.readAsDataURL(file);
  }
  function removeQr() { setPreview(""); setQrImage(""); }

  return (
    <div>
      <SectionTitle icon="⚙️">{t.qr_settings_title}</SectionTitle>
      <div className="ev-card" style={{ padding: 20, maxWidth: 360 }}>
        {preview ? (
          <>
            <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8, fontWeight: 700 }}>{t.qr_current}</div>
            <img src={preview} alt="QR PromptPay" style={{ width: "100%", maxWidth: 220, display: "block", margin: "0 auto 14px", borderRadius: 8, border: "1px solid var(--line)" }} />
            <button className="ev-btn ev-btn-outline" style={{ width: "100%", color: "var(--danger)", borderColor: "var(--danger)" }} onClick={removeQr}>{t.qr_remove}</button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0", opacity: 0.5, fontSize: 13, marginBottom: 14 }}>{t.qr_none_admin}</div>
        )}
        <label className="ev-label" style={{ marginTop: 16 }}>{t.qr_upload_label}</label>
        <input type="file" accept="image/*" onChange={handleFile} style={{ fontSize: 13 }} />
        {error && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 8 }}>{error}</div>}
      </div>
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
  // Customers should never see the "ร้านค้า" (store/admin) switch — it's only
  // revealed to staff who open the link with ?admin=1 (e.g. a bookmarked
  // staff link), so the ordering page shown to guests looks customer-only.
  const [staffAccess, setStaffAccess] = useState(false);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("admin") === "1") setStaffAccess(true);
    } catch (e) { /* no window/location available */ }
  }, []);
  // Secondary, discreet unlock for staff already on the customer page: tapping the
  // home-page logo 5 times in a row reveals the "ร้านค้า" switch. It still leads to
  // the same real admin login (email + password) — this only reveals the button.
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

  // Register a new member BEFORE they're allowed to pay — no points/spend yet, just an account.
  const registerMember = useCallback((phone, name) => {
    const key = phone.trim();
    if (!key || members[key]) return;
    const newMember = { phone: key, name: (name || "").trim(), points: 0, totalSpent: 0, joinedAt: Date.now() };
    setMembers({ ...members, [key]: newMember });
  }, [members, setMembers]);

  // Full account registration (phone + name + hashed password) for the customer Login/Register
  // pages. If a passwordless "guest" member already exists for this phone (created via the
  // checkout gate above), this upgrades that same record in place — preserving their points and
  // spend history — rather than overwriting it. Returns { ok, reason } so the UI can show the
  // right message without needing a second lookup.
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

  // Placing an order only spends redeemed points immediately (customer chose that discount now).
  // Earned points + totalSpent are only credited once the store marks the order "completed" (see updateOrderStatus).
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

  // Admin confirms the attached PromptPay slip is legitimate — required before the kitchen can start the order.
  const verifySlip = useCallback((id) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, slipVerified: true } : o)));
  }, [orders, setOrders]);

  // Points are only credited (and spend counted toward tier) when an order is marked "completed" —
  // and only once per order, even if the status is later changed again.
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
            settings={settings} setSettings={setSettings} placeOrder={placeOrder} />
        )}
      </div>
    </div>
  );
}

// Inisialisasi data keranjang
let cartTotal = 0;
let itemCount = 0;
let cartItems = [];
const DELIVERY_FEE = 15000; // Biaya pengiriman tetap (Flat Rate)
let notificationTimeout; // Untuk menangani penumpukan animasi notifikasi

// Data Promo
let discountRate = 0;
let appliedPromoCode = "";
const VALID_PROMOS = {
    'HEMAT20': 0.20, // Diskon 20%
    'DELICIO10': 0.10 // Diskon 10%
};

function addToCart(name, price) {
    // Update data
    const existingItem = cartItems.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({ name, price, quantity: 1 });
    }

    cartTotal += price;
    itemCount += 1;

    // Update tampilan UI di navigasi
    updateMainDisplay();
    
    // Tampilkan animasi notifikasi
    showNotification();
}

function updateMainDisplay() {
    const cartCountEl = document.getElementById('cart-count');
    const cartTotalEl = document.getElementById('cart-total');
    const modalTotalEl = document.getElementById('modal-total');

    const discountedTotal = cartTotal * (1 - discountRate);
    const formattedPrice = `Rp ${discountedTotal.toLocaleString('id-ID')}`;

    if (cartCountEl) cartCountEl.innerText = itemCount;
    if (cartTotalEl) cartTotalEl.innerText = formattedPrice;
    if (modalTotalEl) modalTotalEl.innerText = formattedPrice;
}

function renderCartItems() {
    const listContainer = document.getElementById('cart-items-list');
    const modalTotal = document.getElementById('modal-total');

    if (!listContainer) return;

    if (cartItems.length > 0) {
        listContainer.innerHTML = cartItems.map((item, index) => `
            <div class="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div class="flex-1">
                    <p class="font-bold text-gray-800">${item.name}</p>
                    <p class="text-sm text-orange-500 font-medium">Rp ${item.price.toLocaleString('id-ID')}</p>
                </div>
                
                <div class="flex items-center space-x-3 mr-4">
                    <button onclick="changeQuantity(${index}, -1)" class="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition">-</button>
                    <span class="font-bold text-gray-700 w-4 text-center">${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)" class="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition">+</button>
                </div>

                <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors" title="Hapus Item">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        `).join('');
    } else {
        listContainer.innerHTML = `
            <div class="flex flex-col items-center py-10 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p>Keranjang Anda masih kosong.</p>
            </div>`;
    }
    
    // Update tampilan ringkasan harga di modal
    const discountedTotal = cartTotal * (1 - discountRate);
    if (modalTotal) modalTotal.innerText = `Rp ${discountedTotal.toLocaleString('id-ID')}`;
    
    // Jika ada promo, tampilkan info diskon di bawah total
    if (discountRate > 0) {
        const discountAmount = cartTotal * discountRate;
        modalTotal.innerHTML = `<span class="text-sm text-gray-400 line-through block font-normal">Rp ${cartTotal.toLocaleString('id-ID')}</span> Rp ${discountedTotal.toLocaleString('id-ID')} <span class="text-xs text-green-600 block font-normal">Hemat Rp ${discountAmount.toLocaleString('id-ID')}</span>`;
    }
}

function openModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        renderCartItems();
    }
}

function closeModal() {
    const modal = document.getElementById('cart-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function applyPromoCode() {
    const input = document.getElementById('promo-input');
    const message = document.getElementById('promo-message');
    const code = input.value.toUpperCase().trim();

    if (VALID_PROMOS[code]) {
        discountRate = VALID_PROMOS[code];
        appliedPromoCode = code;
        
        message.innerText = `Berhasil! Diskon ${(discountRate * 100)}% diterapkan.`;
        message.className = "text-xs mt-2 text-green-600 block";
        
        updateMainDisplay();
        renderCartItems();
    } else {
        discountRate = 0;
        appliedPromoCode = "";
        
        message.innerText = "Kode promo tidak valid.";
        message.className = "text-xs mt-2 text-red-500 block";
        
        updateMainDisplay();
        renderCartItems();
    }
}

function removeFromCart(index) {
    Swal.fire({
        title: 'Hapus Item?',
        text: `Apakah Anda yakin ingin menghapus ${cartItems[index].name} dari keranjang?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f97316',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            cartTotal -= (cartItems[index].price * cartItems[index].quantity);
            itemCount -= cartItems[index].quantity;
            cartItems.splice(index, 1);

            updateMainDisplay();
            renderCartItems();
        }
    });
}

function changeQuantity(index, delta) {
    const item = cartItems[index];
    
    // Jika jumlah item adalah 1 dan user menekan tombol minus (-1)
    if (delta === -1 && item.quantity === 1) {
        removeFromCart(index);
        return;
    }

    item.quantity += delta;
    cartTotal += (delta * item.price);
    itemCount += delta;

    updateMainDisplay();
    renderCartItems();
}

function showNotification() {
    const toast = document.getElementById('notification');
    if (!toast) return;

    // Bersihkan timeout sebelumnya jika user klik cepat berkali-kali
    clearTimeout(notificationTimeout);
    
    toast.classList.remove('translate-y-32', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    notificationTimeout = setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-32', 'opacity-0');
    }, 2000);
}

function processCheckout() {
    if (cartItems.length === 0) {
        Swal.fire({
            title: 'Keranjang Kosong',
            text: 'Silakan pilih menu terlebih dahulu.',
            icon: 'info',
            confirmButtonColor: '#f97316'
        });
        return;
    }

    const discountedTotal = cartTotal * (1 - discountRate);

    Swal.fire({
        title: 'Pesanan Berhasil!',
        text: `Terima kasih! Total belanja Anda Rp ${(discountedTotal + DELIVERY_FEE).toLocaleString('id-ID')} (termasuk ongkir).`,
        icon: 'success',
        confirmButtonColor: '#f97316'
    }).then(() => {
        resetCart();
        closeModal();
    });
}

function resetCart() {
    cartItems = [];
    cartTotal = 0;
    itemCount = 0;
    discountRate = 0;
    appliedPromoCode = "";
    
    const promoInput = document.getElementById('promo-input');
    const promoMessage = document.getElementById('promo-message');
    if (promoInput) promoInput.value = "";
    if (promoMessage) promoMessage.classList.add('hidden');
    
    updateMainDisplay();
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('-translate-x-full');
}

function openVideoModal() {
    const modal = document.getElementById('video-modal');
    const videoPlayer = document.getElementById('video-player');
    // Ganti dengan path file video lokal Anda (misal: videos/promo.mp4)
    const videoSource = "videos/promo.mp4"; 
    
    if (modal && videoPlayer) {
        videoPlayer.src = videoSource;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        videoPlayer.play();
    }
}

function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const videoPlayer = document.getElementById('video-player');
    if (modal && videoPlayer) {
        videoPlayer.pause();
        videoPlayer.currentTime = 0; // Mengulang video ke awal saat ditutup
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Fitur Scroll Navbar: Berubah warna dan ukuran saat scroll
window.addEventListener('scroll', () => {
    const nav = document.getElementById('main-nav');
    const backToTopBtn = document.getElementById('back-to-top');

    if (window.scrollY > 50) {
        // Saat di-scroll ke bawah: Lebih ramping, transparan (blur), dan bayangan tegas
        nav.classList.add('py-4', 'shadow-lg', 'bg-white/80', 'backdrop-blur-md');
        nav.classList.remove('py-6', 'shadow-sm', 'bg-white');
    } else {
        // Kembali ke posisi awal: Lebih lebar dan putih solid
        nav.classList.add('py-6', 'shadow-sm', 'bg-white');
        nav.classList.remove('py-4', 'shadow-lg', 'bg-white/80', 'backdrop-blur-md');
    }

    // Logika Muncul/Sembunyi Tombol Kembali ke Atas
    if (backToTopBtn) {
        if (window.scrollY > 300) {
            backToTopBtn.classList.remove('opacity-0', 'translate-y-20', 'pointer-events-none');
            backToTopBtn.classList.add('opacity-100', 'translate-y-0');
        } else {
            backToTopBtn.classList.add('opacity-0', 'translate-y-20', 'pointer-events-none');
            backToTopBtn.classList.remove('opacity-100', 'translate-y-0');
        }
    }
});

// Fitur Scroll Spy: Highlight menu aktif saat scroll
const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px', // Memicu perubahan saat bagian atas section mencapai area atas layar
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            const navLinks = document.querySelectorAll('.nav-link');
            
            navLinks.forEach(link => {
                const isActive = link.getAttribute('href') === `#${id}`;
                link.classList.toggle('active', isActive);
            });
        }
    });
}, observerOptions);

// Amati semua section yang memiliki ID
document.querySelectorAll('header[id], section[id]').forEach(section => {
    observer.observe(section);
});

// Update tahun copyright secara otomatis
document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.innerText = new Date().getFullYear();
    }
});

// Reveal Animation on Scroll
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            // Berhenti mengamati setelah elemen muncul agar animasi hanya terjadi sekali
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 }); // Memicu animasi saat 15% elemen masuk ke layar

document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
});

// Event listener untuk klik tombol Kembali ke Atas
document.getElementById('back-to-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
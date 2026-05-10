// Inisialisasi data keranjang
let cartTotal = 0;
let itemCount = 0;
let cartItems = [];
const DELIVERY_FEE = 15000; // Biaya pengiriman tetap (Flat Rate)

function addToCart(name, price) {
    // Update data
    cartTotal += price;
    itemCount += 1;
    cartItems.push({ name, price });

    // Update tampilan UI (UX: memberikan feedback instan)
    document.getElementById('cart-count').innerText = itemCount;
    document.getElementById('cart-total').innerText = 'Rp ' + cartTotal.toLocaleString('id-ID');
    
    // Tampilkan animasi notifikasi
    showNotification();
}

function openModal() {
    const modal = document.getElementById('cart-modal');
    const listContainer = document.getElementById('cart-items-list');
    const modalTotal = document.getElementById('modal-total');
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    if (cartItems.length > 0) {
        listContainer.innerHTML = cartItems.map((item, index) => `
            <div class="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                <div>
                    <p class="font-bold">${item.name}</p>
                    <p class="text-sm text-gray-500">Rp ${item.price.toLocaleString('id-ID')}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        `).join('');
    } else {
        listContainer.innerHTML = '<p class="text-center text-gray-500 py-8">Keranjang Anda masih kosong.</p>';
    }
    
    modalTotal.innerText = 'Rp ' + cartTotal.toLocaleString('id-ID');
}

function closeModal() {
    const modal = document.getElementById('cart-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
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
            cartTotal -= cartItems[index].price;
            itemCount -= 1;
            cartItems.splice(index, 1);

            document.getElementById('cart-count').innerText = itemCount;
            document.getElementById('cart-total').innerText = 'Rp ' + cartTotal.toLocaleString('id-ID');
            
            openModal();
        }
    });
}

function showNotification() {
    const toast = document.getElementById('notification');
    
    toast.classList.remove('translate-y-32', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    setTimeout(() => {
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

    Swal.fire({
        title: 'Pesanan Berhasil!',
        text: `Terima kasih! Total belanja Anda Rp ${(cartTotal + DELIVERY_FEE).toLocaleString('id-ID')} (termasuk ongkir).`,
        icon: 'success',
        confirmButtonColor: '#f97316'
    }).then(() => {
        cartItems = [];
        cartTotal = 0;
        itemCount = 0;
        location.reload(); // Refresh untuk reset state
    });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('-translate-x-full');
}
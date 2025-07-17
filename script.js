document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      alert("Thanks for your message, gorgeous! 💌");
      form.reset();
    });
  }

  // Search Functionality
  const searchInput = document.getElementById("productSearch");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      document.querySelectorAll(".card-title").forEach(title => {
        const card = title.closest(".product-card");
        card.style.display = title.textContent.toLowerCase().includes(query) ? "block" : "none";
      });
    });
  }

  // Dark Mode
  const toggleBtn = document.getElementById("darkToggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });
  }

  // Fetch and Display Products
  fetch("/products")
    .then(res => res.json())
    .then(products => {
      const container = document.getElementById("product-list");
      if (!container) return;

      products.forEach(p => {
        const card = document.createElement("div");
        card.className = "col-md-4 product-card";
        card.innerHTML = `
          <div class="card shadow">
            <img src="${p.image_url}" class="card-img-top" alt="${p.name}">
            <div class="card-body text-center">
              <h5 class="card-title">${p.name}</h5>
              <p>${p.description}</p>
              <p class="text-pink fw-bold">$${p.price}</p>
              <button class="btn btn-outline-danger rounded-pill add-to-cart" data-product-id="${p.id}">Add to Cart</button>
            </div>
          </div>`;
        container.appendChild(card);
      });
    });

  // Handle Add to Cart (Backend-Based)
  document.addEventListener("click", e => {
    if (e.target.classList.contains("add-to-cart")) {
      const productId = e.target.getAttribute("data-product-id");

      fetch("/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: parseInt(productId), quantity: 1 })
      })
      .then(res => res.text())
      .then(msg => alert(msg))
      .catch(err => alert("Cart error: " + err));
    }
  });
});

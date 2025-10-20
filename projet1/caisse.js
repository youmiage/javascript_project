// ---------------------------
//  Cash Register Machine
// ---------------------------

const cashRegister = {
  // Liste des articles disponibles avec leurs prix
  itemsForSale: {
    "Phone": 300,
    "Smart TV": 220,
    "Gaming Console": 150
  },

  // Panier d'achat (shopping cart)
  cart: [],

  // ➕ Ajouter un article dans le panier
  addItem: function(itemName) {
    if (this.itemsForSale[itemName]) {
      this.cart.push(itemName);
      console.log(`${itemName} ajouté au panier.`);
    } else {
      console.log(`❌ Désolé, nous ne vendons pas "${itemName}".`);
    }
  },

  //  Calculer le total des articles
  calculateTotalPrice: function() {
    let total = 0;

    // On parcourt le panier et on additionne les prix
    for (let item of this.cart) {
      total += this.itemsForSale[item];
    }

    // Application de la réduction si total > 400
    if (total > 400) {
      const discount = total * 0.1;
      total -= discount;
      console.log(`✅ Réduction de 10% appliquée. (-$${discount.toFixed(2)})`);
    }

    console.log(`💵 Total à payer : $${total.toFixed(2)}`);
    return total;
  },

  //  Effectuer le paiement
  pay: function(paymentAmount) {
    const totalPrice = this.calculateTotalPrice();

    if (paymentAmount >= totalPrice) {
      const change = paymentAmount - totalPrice;
      console.log("✅ Merci pour votre achat !");
      if (change > 0) {
        console.log(`💰 Votre monnaie : $${change.toFixed(2)}`);
      }
      this.cart = []; // Vider le panier après paiement
    } else {
      const missing = totalPrice - paymentAmount;
      console.log(`⚠️ Paiement insuffisant. Il manque $${missing.toFixed(2)}.`);
    }
  }
};

// ---------------------------
//  Exemple d'utilisation
// ---------------------------

// Ajout d'articles
cashRegister.addItem("Phone");
cashRegister.addItem("Smart TV");
cashRegister.addItem("Gaming Console");
cashRegister.addItem("Laptop"); // Article non disponible
// Calculer le total et payer
cashRegister.pay(700); // Paiement en espèces
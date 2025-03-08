export const validateCheckoutForm = (
    address: string,
    paymentMethod: string
  ): [boolean, string[]] => {
    const errors = [];
    
    if (address.trim().length < 10) {
      errors.push("L'adresse doit contenir au moins 10 caractères");
    }
    
    if (!/^(Carte|Espèces|Mobile Money)$/i.test(paymentMethod)) {
      errors.push("Méthode de paiement non supportée");
    }
  
    return [errors.length === 0, errors];
  };
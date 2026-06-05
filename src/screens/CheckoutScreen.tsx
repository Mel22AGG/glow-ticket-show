import { ArrowLeft, CreditCard, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/lib/data";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTickets } from "@/hooks/useTickets";
import { toast } from "@/hooks/use-toast";

interface CheckoutScreenProps {
  event: Event;
  section: string;
  quantity: number;
  total: number;
  onBack: () => void;
  onComplete: () => void;
}

const CheckoutScreen = ({ event, section, quantity, total, onBack, onComplete }: CheckoutScreenProps) => {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const { purchase } = useTickets();

  const serviceFee = Math.round(total * 0.1);
  const grandTotal = total + serviceFee;

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");

    const formatted = cleaned
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");

    setCardNumber(formatted);
  };

  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");

    if (cleaned.length <= 2) {
      setExpiry(cleaned);
      return;
    }

    setExpiry(
      cleaned.slice(0, 2) +
      "/" +
      cleaned.slice(2, 4)
    );
  };

  const handleCVVChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    setCvv(cleaned.slice(0, 3));
  };

  const handlePurchase = async () => {
    if (cardNumber.replace(/\s/g, "").length !== 16) {
  toast({
    title: "Tarjeta inválida",
    description: "La tarjeta debe tener 16 dígitos",
    variant: "destructive",
  });
  return;
}

if (expiry.length !== 5) {
  toast({
    title: "Fecha inválida",
    description: "Ingrese una fecha válida MM/AA",
    variant: "destructive",
  });
  return;
}

const month = parseInt(expiry.split("/")[0]);
const year = parseInt(expiry.split("/")[1]);

const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear() % 100;

if (
  year < currentYear ||
  (year === currentYear && month < currentMonth)
) {
  toast({
    title: "Tarjeta vencida",
    description: "La fecha de vencimiento ya expiró",
    variant: "destructive",
  });
  return;
}
    if (month < 1 || month > 12) {
      toast({
        title: "Mes inválido",
        description: "El mes debe estar entre 01 y 12",
        variant: "destructive",
      });
      return;
    }

    if (cvv.length !== 3) {
      toast({
        title: "CVV inválido",
        description: "El CVV debe tener 3 dígitos",
        variant: "destructive",
      });
      return;
    }
    setProcessing(true);
    try {
      await purchase(event, section, quantity, grandTotal);
      setProcessing(false);
      setSuccess(true);
      setTimeout(onComplete, 1800);
    } catch (e) {
      setProcessing(false);
      toast({
        title: "Error en la compra",
        description: e instanceof Error ? e.message : "Intenta de nuevo",
        variant: "destructive",
      });
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 animate-fade-in">
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center animate-pulse-glow">
          <Check className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mt-6">¡Compra exitosa!</h2>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Tu ticket para {event.title} ha sido confirmado
        </p>
        <p className="text-xs text-muted-foreground mt-1">Redirigiendo a tus tickets...</p>
      </div>
    );
  }

  return (
    <div className="pb-28 gradient-mesh min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 safe-top">
        <button onClick={onBack} aria-label="Volver" className="p-2 rounded-full glass-strong text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Checkout</h1>
      </div>

      {/* Order Summary */}
      <div className="px-4 mt-2">
        <div className="glass-strong rounded-2xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Resumen del pedido</h3>
          <div className="flex gap-3">
            <img src={event.image} alt={event.title} className="w-16 h-16 rounded-lg object-cover" loading="lazy" />
            <div className="flex-1">
              <p className="font-bold text-sm text-foreground">{event.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{event.venue}, {event.city}</p>
              <p className="text-xs text-muted-foreground">{section} · {quantity} ticket{quantity > 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${total} USD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cargo por servicio</span>
              <span className="text-foreground">${serviceFee} USD</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-secondary">${grandTotal} USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Método de pago</h3>
        <div className="flex flex-col gap-2">
          {[
            { id: "card", label: "Tarjeta de crédito/débito", icon: "💳" },
          ].map((method) => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                paymentMethod === method.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              )}
            >
              <span className="text-xl">{method.icon}</span>
              <span className="text-sm font-medium text-foreground">{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card Form (simplified) */}
      {paymentMethod === "card" && (
        <div className="px-4 mt-4">
          <div className="glass-strong rounded-2xl p-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Número de tarjeta</label>
              <input
                type="text"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Vencimiento</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  placeholder="MM/AA"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">CVV</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cvv}
                  onChange={(e) => handleCVVChange(e.target.value)}
                  placeholder="123"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Badge */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4 text-primary" />
          <span>Pago seguro con encriptación SSL</span>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/90 backdrop-blur-lg border-t border-border">
        <Button
          variant="hero"
          size="lg"
          className="w-full"
          onClick={handlePurchase}
          disabled={processing}
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Procesando...
            </span>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pagar ${grandTotal} USD
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutScreen;

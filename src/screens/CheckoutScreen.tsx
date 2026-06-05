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
  const { purchase } = useTickets();

  const serviceFee = Math.round(total * 0.1);
  const grandTotal = total + serviceFee;

  const handlePurchase = async () => {
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
                placeholder="1234 5678 9012 3456"
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Vencimiento</label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">CVV</label>
                <input
                  type="text"
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

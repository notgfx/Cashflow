import { PaymentNode } from "@/components/payment/PaymentNode";

type MarginNodeProps = {
  value: string;
  formula: string;
};

export function MarginNode({ value, formula }: MarginNodeProps) {
  return (
    <PaymentNode
      title="Маржа"
      value={value}
      formula={formula}
      variant="margin"
      className="max-w-lg"
    />
  );
}

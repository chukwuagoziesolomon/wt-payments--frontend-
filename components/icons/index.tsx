import {
  CreditCard,
  LayoutGrid,
  Activity,
  Settings,
  DollarSign,
  Wallet,
} from "lucide-react";
import type { Ref, SVGAttributes } from "react";

const Icons = {
  currencyIcon: DollarSign,
  overviewIcon: LayoutGrid,
  payoutIcon: CreditCard,
  transactionsIcon: Activity,
  settingsIcon: Settings,
  walletIcon: Wallet,
};
export interface IconProps extends SVGAttributes<SVGElement> {
  ref?: Ref<SVGSVGElement>;
}
export type IconType = keyof typeof Icons;
export { Icons };
export default Icons;

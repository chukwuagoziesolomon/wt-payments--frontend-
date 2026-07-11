import {
  CreditCard,
  LayoutGrid,
  LeafIcon,
  Settings,
  Turntable,
  WalletMinimal,
} from "lucide-react";
import type { Ref, SVGAttributes } from "react";

const Icons = {
  currencyIcon: Turntable,
  overviewIcon: LayoutGrid,
  payoutIcon: CreditCard,
  transactionsIcon: LeafIcon,
  settingsIcon: Settings,
  walletIcon: WalletMinimal,
};
export interface IconProps extends SVGAttributes<SVGElement> {
  ref?: Ref<SVGSVGElement>;
}
export type IconType = keyof typeof Icons;
export default Icons;

declare module "expo-confetti" {
  import { ViewProps } from "react-native";

  interface ConfettiProps extends ViewProps {
    count?: number;
    origin?: { x: number; y: number };
    colors?: string[];
  }

  const Confetti: React.FC<ConfettiProps>;
  export default Confetti;
}

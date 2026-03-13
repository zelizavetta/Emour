import { Ionicons } from "@expo/vector-icons";

interface IconProps {
  name: any;
  size?: number;
  color?: string;
}

export default function Icon({
  name,
  size = 24,
  color = "black"
}: IconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
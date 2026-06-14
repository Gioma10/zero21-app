import { type ReactNode } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, "style"> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Quanto "affonda" alla pressione. Più piccolo = più sottile. */
  scaleTo?: number;
};

/**
 * Pressable con micro-feedback: alla pressione affonda di poco e torna su con
 * una curva ease-out. È un segnale di stato (sto premendo), non decorazione —
 * e si annulla da solo se l'utente ha attivato "riduci movimento".
 */
export function PressableScale({ children, style, scaleTo = 0.96, ...rest }: Props) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPressIn={() => {
        // eslint-disable-next-line react-hooks/immutability -- assegnare a .value è il pattern Reanimated per le shared value
        if (!reduceMotion) scale.value = withTiming(scaleTo, { duration: 120 });
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability -- come sopra
        scale.value = withTiming(1, { duration: 220 });
      }}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

import { useDispatch, useSelector } from "react-redux";
import type { Despacho, Estado } from "./store";

/** Los de react-redux, pero ya sabiendo de qué estado hablan. */
export const useDespacho = useDispatch.withTypes<Despacho>();
export const useEstado = useSelector.withTypes<Estado>();

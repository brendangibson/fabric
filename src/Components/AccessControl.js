import { useContext } from "react";
import { TradeContext } from "../WebApp";

const AccessControl = ({ children }) => {
  const isTrade = useContext(TradeContext);
  return isTrade ? null : children;
};

export default AccessControl;

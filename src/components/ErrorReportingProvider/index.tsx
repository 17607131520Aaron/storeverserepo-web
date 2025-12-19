import { useEffect, type ReactNode } from "react";

import { initGlobalClientErrorReporting } from "@/utils/errorReporter";

interface ErrorReportingProviderProps {
  children: ReactNode;
}

const ErrorReportingProvider: React.FC<ErrorReportingProviderProps> = ({ children }) => {
  useEffect(() => {
    const clean = initGlobalClientErrorReporting();
    return () => {
      if (clean) clean();
    };
  }, []);

  return <>{children}</>;
};

export default ErrorReportingProvider;

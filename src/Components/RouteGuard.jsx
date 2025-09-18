import React from 'react';
import { useRouteStatusChecker } from './hooks/useRouteStatusChecker';

export const RouteGuard = ({ children, token, handleLogout, versionNo }) => {
  useRouteStatusChecker(token, handleLogout, versionNo);
  return children;
};
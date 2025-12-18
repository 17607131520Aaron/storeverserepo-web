import { lazy } from 'react';

import { createHashRouter } from 'react-router-dom';

import type { DataRouter } from 'react-router-dom';

const LayoutHome = lazy(() => import('@/app'));
const Home = lazy(() => import('@/pages/Home'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Dashboard 模块
const DashboardOverview = lazy(() => import('@/pages/Dashboard/Overview'));
const DashboardAnalysis = lazy(() => import('@/pages/Dashboard/Analysis'));

// Documents 模块
const DocumentsList = lazy(() => import('@/pages/Documents/List'));
const DocumentsCategory = lazy(() => import('@/pages/Documents/Category'));
const DocumentsTrash = lazy(() => import('@/pages/Documents/Trash'));

// Team 模块
const TeamMembers = lazy(() => import('@/pages/Team/Members'));
const TeamRoles = lazy(() => import('@/pages/Team/Roles'));
const TeamDepartments = lazy(() => import('@/pages/Team/Departments'));

// Barcode 模块
const BarcodeManage = lazy(() => import('@/pages/Barcode/Manage'));

// Settings 模块
const SettingsBasic = lazy(() => import('@/pages/Settings/Basic'));
const SettingsSecurity = lazy(() => import('@/pages/Settings/Security'));
const SettingsLogs = lazy(() => import('@/pages/Settings/Logs'));

const SmartserviceappDebugLogs = lazy(() => import('@/pages/smartserviceappDebug/Debuglogs'));
const SmartserviceappDebugNetwork = lazy(() => import('@/pages/smartserviceappDebug/Network'));

const router: DataRouter = createHashRouter([
  {
    path: '/',
    element: <LayoutHome />,
    children: [
      { index: true, element: <Home /> },
      // Dashboard 路由
      {
        path: '/dashboard/overview',
        element: <DashboardOverview />,
      },
      {
        path: '/dashboard/analysis',
        element: <DashboardAnalysis />,
      },
      // Documents 路由
      {
        path: '/documents/list',
        element: <DocumentsList />,
      },
      {
        path: '/documents/category',
        element: <DocumentsCategory />,
      },
      {
        path: '/documents/trash',
        element: <DocumentsTrash />,
      },
      // Team 路由
      {
        path: '/team/members',
        element: <TeamMembers />,
      },
      {
        path: '/team/roles',
        element: <TeamRoles />,
      },
      {
        path: '/team/departments',
        element: <TeamDepartments />,
      },
      {
        path: '/barcode/manage',
        element: <BarcodeManage />,
      },
      // Settings 路由
      {
        path: '/settings/basic',
        element: <SettingsBasic />,
      },
      {
        path: '/settings/security',
        element: <SettingsSecurity />,
      },
      {
        path: '/settings/logs',
        element: <SettingsLogs />,
      },
      {
        path: '/smartserviceappDebug/debuglogs',
        element: <SmartserviceappDebugLogs />,
      },
      {
        path: '/smartserviceappDebug/network',
        element: <SmartserviceappDebugNetwork />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;

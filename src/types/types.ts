import { AdminRole, ModulePermissions } from '../models/admin/AdminUser';

export interface AdminPayload {
  id: string;
    uid: string;                          
  role: AdminRole;                     

  email: string;
  roles: AdminRole[];        // الأدوار المصرح بها
  permissions: ModulePermissions; // خريطة الصلاحيات لكل قسم
  iat: number;
  exp: number;
}

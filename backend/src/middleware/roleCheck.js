/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts route access to specific user roles ('CUSTOMER', 'DRIVER', 'ADMIN')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to role verification.'
      });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${allowedRoles.join(', ')}], but your role is '${req.user.role}'.`
      });
    }

    next();
  };
}

module.exports = {
  requireRole
};

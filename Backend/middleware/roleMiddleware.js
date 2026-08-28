const roleMiddleware = (allowedRoles) => {

    return (req, res, next) => {

        console.log("=================================");
        console.log("USER FROM TOKEN:", req.user);
        console.log("ALLOWED ROLES:", allowedRoles);
        console.log("USER ROLE:", req.user?.role);
        console.log("=================================");


        if (!req.user) {

            return res.status(401).json({
                message: "User not authenticated"
            });

        }


        // Convert role to lowercase
        const userRole =
            String(req.user.role || "")
                .trim()
                .toLowerCase();


        // Convert allowed roles to lowercase
        const roles =
            allowedRoles.map(
                role =>
                    String(role)
                        .trim()
                        .toLowerCase()
            );


        if (!roles.includes(userRole)) {

            console.log(
                "ACCESS DENIED - USER ROLE:",
                userRole
            );

            return res.status(403).json({
                message: "Access denied",
                userRole: userRole,
                allowedRoles: roles
            });

        }


        console.log(
            "ROLE AUTHORIZED:",
            userRole
        );


        next();

    };

};


module.exports = roleMiddleware;
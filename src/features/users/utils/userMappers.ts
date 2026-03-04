export const userMapper = (user: any) => {
    return {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        isDeleted: user.is_deleted ?? false,
    }
}
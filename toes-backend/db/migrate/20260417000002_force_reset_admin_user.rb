class ForceResetAdminUser < ActiveRecord::Migration[8.0]
  def up
    username = ENV.fetch("ADMIN_USERNAME", "techsa.unimtech.edu@gmail.com")
    password = ENV.fetch("ADMIN_PASSWORD", "TechsaUmt@2026!")

    # Wipe all admin users and recreate cleanly via the model (handles bcrypt correctly)
    AdminUser.destroy_all
    AdminUser.create!(
      username: username,
      password: password,
      password_confirmation: password
    )
    puts "=== Admin user created: #{username} ==="
  end

  def down
  end
end

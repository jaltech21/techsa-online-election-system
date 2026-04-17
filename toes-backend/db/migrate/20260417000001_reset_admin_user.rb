class ResetAdminUser < ActiveRecord::Migration[8.0]
  def up
    username = ENV.fetch("ADMIN_USERNAME", "techsa.unimtech.edu@gmail.com")
    password = ENV.fetch("ADMIN_PASSWORD", "TechsaUmt@2026!")
    digest = BCrypt::Password.create(password)

    result = execute("SELECT id FROM admin_users WHERE username = '#{username.gsub("'", "''")}'")
    if result.any?
      execute("UPDATE admin_users SET password_digest = '#{digest}', updated_at = NOW() WHERE username = '#{username.gsub("'", "''")}'")
      puts "Admin password reset for: #{username}"
    else
      execute("INSERT INTO admin_users (username, password_digest, created_at, updated_at) VALUES ('#{username.gsub("'", "''")}', '#{digest}', NOW(), NOW())")
      puts "Admin user created: #{username}"
    end
  end

  def down
  end
end

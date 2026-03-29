# Seed initial admin user
# Credentials can be overridden via environment variables in production
admin_username = ENV.fetch("ADMIN_USERNAME", "techsa.unimtech.edu@gmail.com")
admin_password = ENV.fetch("ADMIN_PASSWORD", "TechsaUmt@2026!")

admin = AdminUser.find_or_initialize_by(username: admin_username)
admin.password = admin_password
admin.password_confirmation = admin_password
admin.save!

puts "Admin user ready: #{admin.username}"

# Seed a sample election in draft state for development
if Rails.env.development?
  election = Election.find_or_create_by!(title: "TECHSA General Elections 2026") do |e|
    e.description = "Annual election for TECHSA Executive Cabinet positions."
    e.status = :draft
  end
  puts "Sample election ready: #{election.title}"
end

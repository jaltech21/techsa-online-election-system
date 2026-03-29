# Seed initial admin user
# Credentials can be overridden via environment variables in production
admin = AdminUser.find_or_create_by!(username: ENV.fetch("ADMIN_USERNAME", "admin")) do |a|
  a.password = ENV.fetch("ADMIN_PASSWORD", "changeme123!")
  a.password_confirmation = ENV.fetch("ADMIN_PASSWORD", "changeme123!")
end

puts "Admin user ready: #{admin.username}"

# Seed a sample election in draft state for development
if Rails.env.development?
  election = Election.find_or_create_by!(title: "TECHSA General Elections 2026") do |e|
    e.description = "Annual election for TECHSA Executive Cabinet positions."
    e.status = :draft
  end
  puts "Sample election ready: #{election.title}"
end

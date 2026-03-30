class AdminUser < ApplicationRecord
  has_secure_password

  has_many :announcements, dependent: :nullify

  validates :username, presence: true, uniqueness: true
end

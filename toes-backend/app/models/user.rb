class User < ApplicationRecord
  has_secure_password

  has_many :votes, foreign_key: :voter_id, dependent: :destroy
  has_many :questions, foreign_key: :student_id, dependent: :destroy
  has_one :candidate

  validates :student_id, presence: true, uniqueness: true
  validates :name, presence: true
  validates :email,
            presence: { message: "is required" },
            uniqueness: { case_sensitive: false, message: "is already registered" },
            format: { with: URI::MailTo::EMAIL_REGEXP, message: "must be a valid email address" }
  validates :password, length: { minimum: 6 }, if: :password_required?

  private

  def password_required?
    new_record? || password.present?
  end
end

class User < ApplicationRecord
  has_secure_password

  has_many :votes, foreign_key: :voter_id, dependent: :destroy
  has_many :questions, foreign_key: :student_id, dependent: :destroy
  has_one :candidate

  validates :student_id, presence: true, uniqueness: true
  validates :name, presence: true
  validates :password, length: { minimum: 6 }, if: :password_required?

  private

  def password_required?
    new_record? || password.present?
  end
end

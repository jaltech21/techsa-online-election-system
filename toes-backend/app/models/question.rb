class Question < ApplicationRecord
  belongs_to :student, class_name: "User"
  belongs_to :candidate

  validates :body, presence: true
  validates :student, :candidate, presence: true

  scope :pinned_first, -> { order(pinned: :desc, created_at: :desc) }
end

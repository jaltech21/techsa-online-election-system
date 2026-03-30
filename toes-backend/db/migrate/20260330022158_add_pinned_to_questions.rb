class AddPinnedToQuestions < ActiveRecord::Migration[8.0]
  def change
    add_column :questions, :pinned, :boolean
  end
end

class CreateQuestions < ActiveRecord::Migration[8.0]
  def change
    create_table :questions do |t|
      t.text :body, null: false
      t.references :student, null: false, foreign_key: { to_table: :users }
      t.references :candidate, null: false, foreign_key: true
      t.text :answer
      t.boolean :answered, null: false, default: false

      t.timestamps
    end
  end
end

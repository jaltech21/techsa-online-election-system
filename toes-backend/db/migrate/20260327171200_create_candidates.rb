class CreateCandidates < ActiveRecord::Migration[8.0]
  def change
    create_table :candidates do |t|
      t.string :name, null: false
      t.string :position, null: false
      t.text :bio
      t.text :manifesto
      t.references :election, null: false, foreign_key: true
      t.references :registration_key, null: false, foreign_key: true, index: { unique: true }

      t.timestamps
    end
  end
end

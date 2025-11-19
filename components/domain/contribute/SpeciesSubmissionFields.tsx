"use client"

import { Fragment } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import type { ContributionFormValues } from '@/lib/domain/submission-form'

type Props = {
  form: UseFormReturn<ContributionFormValues>
  readOnly?: boolean
  onSlugAuto?: () => void
  onSlugManual?: () => void
  step?: 1 | 2 | 3 | 4
}

export function SpeciesSubmissionFields({ form, readOnly, onSlugAuto, onSlugManual, step }: Props) {
  const taxonomyCopy: Record<'kingdom' | 'phylum' | 'class' | 'order' | 'family' | 'genus' | 'species', string> = {
    kingdom: 'Kingdom is required',
    phylum: 'Phylum is required',
    class: 'Class is required',
    order: 'Order is required',
    family: 'Family is required',
    genus: 'Genus is required',
    species: 'Species epithet is required',
  }

  const sectionOrder = [
    'identity',
    'taxonomyPrimary',
    'taxonomySecondary',
    'taxonomyTertiary',
    'taxonomyQuaternary',
    'descriptions',
    'story',
    'status',
    'media',
  ] as const
  type SectionKey = (typeof sectionOrder)[number]

  const groupedSections: Record<1 | 2 | 3 | 4, SectionKey[]> = {
    1: ['identity'],
    2: ['taxonomyPrimary', 'taxonomySecondary', 'taxonomyTertiary', 'taxonomyQuaternary'],
    3: ['descriptions', 'story'],
    4: ['status', 'media'],
  }

  const sections: Record<SectionKey, JSX.Element> = {
    identity: (
      <section className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="scientific_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scientific name</FormLabel>
              <FormControl>
                <Input placeholder="E.g. Tulipa gesneriana" {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="common_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Common name</FormLabel>
              <FormControl>
                <Input placeholder="E.g. Tulip" {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Slug</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="tulipa-gesneriana"
                    {...field}
                    onChange={(event) => {
                      onSlugManual?.()
                      field.onChange(event)
                    }}
                    disabled={readOnly}
                  />
                </FormControl>
                {!readOnly && (
                  <Button type="button" variant="secondary" onClick={onSlugAuto}>
                    Auto
                  </Button>
                )}
              </div>
              <FormDescription>This will be used as the species URL.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>
    ),
    taxonomyPrimary: (
      <section className="grid gap-4 md:grid-cols-2">
        {(['kingdom', 'phylum'] as const).map((fieldName) => (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="capitalize">{fieldName}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={readOnly} />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">{taxonomyCopy[fieldName]}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </section>
    ),
    taxonomySecondary: (
      <section className="grid gap-4 md:grid-cols-2">
        {(['class', 'order'] as const).map((fieldName) => (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="capitalize">{fieldName}</FormLabel>
                <FormControl>
                  <Input placeholder={fieldName === 'order' ? 'Liliales' : undefined} {...field} disabled={readOnly} />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">{taxonomyCopy[fieldName]}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </section>
    ),
    taxonomyTertiary: (
      <section className="grid gap-4 md:grid-cols-2">
        {(['family', 'genus'] as const).map((fieldName) => (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="capitalize">{fieldName}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={readOnly} />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">{taxonomyCopy[fieldName]}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </section>
    ),
    taxonomyQuaternary: (
      <section className="grid gap-4">
        <FormField
          control={form.control}
          name="species"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Species epithet</FormLabel>
              <FormControl>
                <Input {...field} disabled={readOnly} />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">{taxonomyCopy.species}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>
    ),
    descriptions: (
      <section className="grid gap-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short description</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="info_detail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed info / story</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} disabled={readOnly} />
              </FormControl>
              <FormDescription>Appears on the detail page as the main narrative.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>
    ),
    story: (
      <section className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="morphology"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Morphology</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="habitat_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Habitat</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>
    ),
    status: (
      <section className="grid gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name="conservation_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conservation status</FormLabel>
              <FormControl>
                <Input {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="iucn_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IUCN code</FormLabel>
              <FormControl>
                <Input placeholder="NE / EN / CR" {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2 rounded-2xl border border-border/60 px-4 py-3">
              <div className="flex items-center justify-between">
                <FormLabel>Mark as featured</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} disabled={readOnly} />
                </FormControl>
              </div>
              <FormDescription>Featured species appear on the homepage carousel.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>
    ),
    media: (
      <section className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="image_inputs"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Reference image URLs</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="https://example.com/image-1.jpg&#10;https://example.com/image-2.jpg"
                  {...field}
                  disabled={readOnly}
                />
              </FormControl>
              <FormDescription>One URL per line. First image becomes the preview.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="habitatLatitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Habitat latitude</FormLabel>
                <FormControl>
                  <Input type="number" step="0.0001" {...field} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="habitatLongitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Habitat longitude</FormLabel>
                <FormControl>
                  <Input type="number" step="0.0001" {...field} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>
    ),
  }

  const activeKeys = step ? groupedSections[step] : sectionOrder

  return (
    <div className="space-y-6">
      {sectionOrder
        .filter((key) => activeKeys.includes(key))
        .map((key) => (
          <Fragment key={key}>{sections[key]}</Fragment>
        ))}
    </div>
  )
}

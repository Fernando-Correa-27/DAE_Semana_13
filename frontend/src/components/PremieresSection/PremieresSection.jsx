import { Swiper, SwiperSlide } from 'swiper/react'
import { A11y, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import PremiereCard from '../PremiereCard/PremiereCard'
import PremiereSkeleton from '../PremiereSkeleton/PremiereSkeleton'
import Button from '../Button/Button'
import EmptyState from '../EmptyState/EmptyState'
import usePremieres from '../../hooks/usePremieres'
import useWindowSize, { getSlidesPerView } from '../../hooks/useWindowSize'
import { UI_TEXT } from '../../utils/constants'
import './PremieresSection.css'

const SLIDE_GAP_PX = 24

/**
 * Forthcoming releases section. It owns the premiere request through
 * usePremieres and the responsive slide count through useWindowSize, so App
 * never stores data that only this section needs.
 */
function PremieresSection() {
  const { premieres, status, error, retry } = usePremieres()
  const { width } = useWindowSize()
  const slidesPerView = getSlidesPerView(width)

  const isLoading = status === 'loading'
  const isError = status === 'error'
  const isEmpty = status === 'success' && premieres.length === 0

  return (
    <section className="premieres" id="premieres" aria-labelledby="premieres-title">
      <div className="section__container">
        <header className="premieres__header">
          <p className="section-eyebrow">{UI_TEXT.PREMIERES_EYEBROW}</p>
          <h2 className="section-title" id="premieres-title">
            {UI_TEXT.PREMIERES_TITLE}
          </h2>
          <p className="premieres__subtitle">{UI_TEXT.PREMIERES_SUBTITLE}</p>
        </header>

        <div className="premieres__body" aria-busy={isLoading}>
          {isLoading && (
            <div
              className="premieres__skeletons"
              style={{ '--premiere-columns': slidesPerView }}
              role="status"
              aria-live="polite"
            >
              {Array.from({ length: slidesPerView }, (_, index) => (
                <PremiereSkeleton key={index} showLabel={index === 0} />
              ))}
            </div>
          )}

          {isError && (
            <div className="premieres__feedback" role="alert">
              <span className="premieres__feedback-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7.5v5M12 16.5h.01" strokeLinecap="round" />
                </svg>
              </span>
              <h3 className="premieres__feedback-title">{UI_TEXT.PREMIERES_ERROR_TITLE}</h3>
              <p className="premieres__feedback-message">
                {error ?? UI_TEXT.PREMIERES_ERROR}
              </p>
              <Button variant="secondary" onClick={retry}>
                {UI_TEXT.RETRY}
              </Button>
            </div>
          )}

          {isEmpty && (
            <EmptyState
              title={UI_TEXT.PREMIERES_EMPTY}
              message={UI_TEXT.PREMIERES_EMPTY_MESSAGE}
            />
          )}

          {status === 'success' && premieres.length > 0 && (
            <Swiper
              key={`premieres-${slidesPerView}`}
              className="premieres__carousel"
              modules={[Navigation, Pagination, A11y]}
              slidesPerView={slidesPerView}
              spaceBetween={SLIDE_GAP_PX}
              navigation
              pagination={{ clickable: true }}
              rewind
              watchOverflow
              a11y={{
                enabled: true,
                containerMessage: UI_TEXT.PREMIERES_CAROUSEL_LABEL,
                prevSlideMessage: UI_TEXT.PREVIOUS_SLIDE,
                nextSlideMessage: UI_TEXT.NEXT_SLIDE,
                paginationBulletMessage: `${UI_TEXT.GO_TO_SLIDE} {{index}}`,
              }}
            >
              {premieres.map((premiere) => (
                <SwiperSlide key={premiere.id}>
                  <PremiereCard premiere={premiere} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  )
}

export default PremieresSection
